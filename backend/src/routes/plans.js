import express from 'express';
import Groq from 'groq-sdk';
import PDFDocument from 'pdfkit';
import { requireAuth, supabase } from '../middleware/auth.js';

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Get user's recent plans
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, plans: data });
  } catch (error) {
    next(error);
  }
});

// Get a specific plan
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, plan: data });
  } catch (error) {
    next(error);
  }
});

// Generate Plan
router.post('/generate', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid request payload' });
    }
    
    // Basic validation
    if (!formData.goal || !formData.subjects || !Array.isArray(formData.subjects) || formData.subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Goal and subjects are required' });
    }
    if (!formData.durationValue || formData.durationValue <= 0 || !formData.durationUnit) {
      return res.status(400).json({ success: false, message: 'Valid duration is required' });
    }

    // 1. Check trials before generation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('trials_remaining, total_free_trials, trials_used')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');
    
    if (profile.trials_remaining <= 0) {
      return res.status(403).json({
        success: false,
        code: 'NO_TRIALS_REMAINING',
        message: 'Your free study-plan trials are complete.'
      });
    }

    const systemPrompt = `You are StudySync AI, an expert academic planner. Generate a highly personalized study schedule.
Output ONLY valid JSON matching this schema exactly:
{
  "schedule": [
    {
      "day": "Day 1 (or specific Date)",
      "date": "Optional specific date string",
      "activities": [
        {
          "subject": "Subject Name",
          "duration": "Time (e.g., 90 minutes)",
          "topic": "Specific topic to cover",
          "description": "What to do exactly, aligned with learning preferences"
        }
      ]
    }
  ]
}
Do not include any markdown formatting like \`\`\`json. Return only the raw JSON string.`;

    const userPrompt = `
Create a study plan with the following constraints:
- Goal: ${formData.goal === 'Other' ? formData.customGoal : formData.goal}
- Subjects: ${formData.subjects.join(', ')}
- Priority Subjects: ${formData.prioritySubjects.join(', ')}
- Knowledge Level: ${formData.knowledgeLevel}
- Duration: ${formData.durationValue} ${formData.durationUnit}
- Daily Study Time: ${formData.dailyStudyHours} hours
- Preferred Times: ${formData.preferredStudyTimes.join(', ')}
- Available Days: ${formData.availableDays.join(', ')}
- Learning Preferences: ${formData.learningPreferences.join(', ')}
${formData.targetDate ? `- Target Date: ${formData.targetDate}` : ''}
${formData.additionalRequirements ? `- Additional Requirements: ${formData.additionalRequirements}` : ''}

Ensure the schedule ONLY uses the Available Days and spreads the subjects according to Priority. Total daily study time should match the request. Limit the output to a manageable schedule (e.g., first 1-2 weeks if the duration is very long, to fit context limits, but represent it clearly).
`;

    // 2. Save Questionnaire Response
    const { data: qResponse, error: qError } = await supabase
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        goal: formData.goal,
        custom_goal: formData.customGoal || null,
        subjects: formData.subjects,
        priority_subjects: formData.prioritySubjects,
        knowledge_level: formData.knowledgeLevel,
        duration_value: formData.durationValue,
        duration_unit: formData.durationUnit,
        daily_study_hours: formData.dailyStudyHours,
        preferred_study_times: formData.preferredStudyTimes,
        available_days: formData.availableDays,
        learning_preferences: formData.learningPreferences,
        target_date: formData.targetDate || null,
        additional_requirements: formData.additionalRequirements || null,
      })
      .select()
      .single();

    if (qError) throw new Error("Failed to save questionnaire data.");

    let generatedJSON;
    const modelName = process.env.GROQ_MODEL || 'llama3-8b-8192';
    try {
      // 3. Generate via Groq
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: modelName,
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      try {
        generatedJSON = JSON.parse(chatCompletion.choices[0]?.message?.content);
        
        // 3b. Validate AI Output Schema
        if (!generatedJSON || typeof generatedJSON !== 'object') throw new Error("Invalid structure");
        if (!generatedJSON.schedule || !Array.isArray(generatedJSON.schedule) || generatedJSON.schedule.length === 0) throw new Error("Invalid or empty schedule");
        for (const day of generatedJSON.schedule) {
          if (!day.day || !Array.isArray(day.activities) || day.activities.length === 0) throw new Error("Invalid day or empty activities");
          for (const activity of day.activities) {
            if (!activity.subject || !activity.duration || !activity.description) throw new Error("Activity missing required fields");
          }
        }
      } catch (parseError) {
        throw new Error("AI generated an invalid response format or schema.");
      }

      const planTitle = `${formData.durationValue} ${formData.durationUnit} ${formData.goal === 'Other' ? formData.customGoal : formData.goal}`;

      // 4 & 5. Atomically Consume Trial and Save Study Plan
      const { data: rpcResult, error: rpcError } = await supabase.rpc('save_plan_and_consume_trial', {
        p_user_id: userId,
        p_questionnaire_id: qResponse.id,
        p_title: planTitle,
        p_goal: formData.goal === 'Other' ? formData.customGoal : formData.goal,
        p_duration_value: formData.durationValue,
        p_duration_unit: formData.durationUnit,
        p_plan_data: generatedJSON,
        p_model_name: modelName
      });
      
      if (rpcError || !rpcResult?.success) {
        throw new Error(rpcResult?.message || "Failed to consume trial or save plan.");
      }

      const pResponseId = rpcResult.plan_id;

      res.json({
        success: true,
        data: {
          plan_id: pResponseId,
          questionnaire_id: qResponse.id,
          schedule: generatedJSON.schedule,
          trial: {
            trials_used: profile.trials_used + 1,
            trials_remaining: profile.trials_remaining - 1,
            total_free_trials: profile.total_free_trials
          }
        }
      });

    } catch (genError) {
      console.error("Generation/Consumption failed", genError);
      // Save failed plan
      const planTitle = `${formData.durationValue} ${formData.durationUnit} ${formData.goal === 'Other' ? formData.customGoal : formData.goal}`;
      await supabase.from('study_plans').insert({
        user_id: userId,
        questionnaire_id: qResponse.id,
        title: planTitle,
        plan_data: {},
        status: 'failed',
        error_message: genError.message,
        model_name: modelName
      });
      // Important: Trial was not decremented here because we throw before rpc or rpc fails.
      return res.status(500).json({ success: false, message: genError.message || 'Generation failed' });
    }

  } catch (error) {
    next(error);
  }
});

// PDF Generation endpoint
router.get('/:id/pdf', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data: plan, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .single();

    if (error || !plan) {
      return res.status(404).json({
        success: false,
        code: 'PDF_GENERATION_FAILED',
        message: "We couldn't create the PDF right now. Please try again."
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `studysync-ai-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(24).fillColor('#0f172a').text('StudySync AI', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#4f46e5').text(plan.title, { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(12).fillColor('#475569').text(`Goal: ${plan.goal} | Duration: ${plan.duration_value} ${plan.duration_unit}`, { align: 'center' });
    doc.moveDown(2);

    const schedule = plan.plan_data.schedule || [];
    schedule.forEach(day => {
      doc.fontSize(14).fillColor('#0f172a').text(`${day.day}${day.date ? ' - ' + day.date : ''}`, { underline: true });
      doc.moveDown(0.5);
      
      const activities = day.activities || [];
      activities.forEach(activity => {
        doc.fontSize(12).fillColor('#0f172a').text(`${activity.subject}`, { continued: true });
        doc.fillColor('#4f46e5').text(`  [${activity.duration}]`);
        if (activity.topic) {
          doc.fontSize(10).fillColor('#475569').text(`Topic: ${activity.topic}`);
        }
        doc.fontSize(10).fillColor('#475569').text(activity.description);
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    });

    doc.end();

  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({
      success: false,
      code: 'PDF_GENERATION_FAILED',
      message: "We couldn't create the PDF right now. Please try again."
    });
  }
});

// Feedback Endpoint
router.post('/:id/feedback', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, was_useful, difficulty_appropriate, time_allocation_realistic, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 is required' });
    }

    // Verify ownership
    const { data: plan, error: planError } = await supabase
      .from('study_plans')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        study_plan_id: id,
        rating,
        was_useful,
        difficulty_appropriate,
        time_allocation_realistic,
        comments: comments || null
      });

    if (feedbackError) {
      if (feedbackError.code === '23505') { // Unique violation
        return res.json({ success: true, message: "Thanks! You've already submitted feedback for this plan." });
      }
      throw feedbackError;
    }

    res.json({ success: true, message: 'Thank you for your feedback! Your response helps us improve StudySync AI.' });
  } catch (error) {
    next(error);
  }
});

export default router;
