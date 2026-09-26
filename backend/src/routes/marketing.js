import express from 'express';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { requireAuth, supabase } from '../middleware/auth.js';

const router = express.Router();

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

router.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch user info from our marketing_subscribers table
    const { data: subscriber, error: fetchError } = await supabase
      .from('marketing_subscribers')
      .select('email, marketing_consent')
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscriber || !subscriber.marketing_consent) {
      return res.status(400).json({ success: false, message: 'No valid marketing consent found.' });
    }

    const listId = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!process.env.MAILCHIMP_API_KEY || !listId) {
      // Safely ignore if not configured, do not break signup
      console.warn("Mailchimp is not configured.");
      return res.json({ success: true, message: 'Skipped Mailchimp due to missing config.' });
    }

    try {
      await mailchimp.lists.setListMember(listId, subscriber.email.toLowerCase(), {
        email_address: subscriber.email,
        status_if_new: 'subscribed',
        status: 'subscribed'
      });
      
      // Update our DB to reflect success
      await supabase.from('marketing_subscribers').update({
        mailchimp_status: 'subscribed',
        subscribed_at: new Date().toISOString()
      }).eq('user_id', userId);

    } catch (mcError) {
      console.error('Mailchimp subscription failed:', mcError.response?.body || mcError.message);
      // We don't throw, we just log it. Account creation remains successful.
      await supabase.from('marketing_subscribers').update({
        mailchimp_status: 'failed'
      }).eq('user_id', userId);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/subscription-interest', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Check for existing interest
    const { data: existing, error: checkError } = await supabase
      .from('subscription_interests')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return res.json({
        success: true,
        already_registered: true,
        message: 'Your interest in StudySync AI Premium has already been recorded.'
      });
    }

    const { data: userProfile } = await supabase.auth.admin.getUserById(userId);
    const email = userProfile?.user?.email || 'unknown@example.com';

    // Insert interest
    const { error: insertError } = await supabase
      .from('subscription_interests')
      .insert({
        user_id: userId,
        email: email,
        plan_name: 'premium',
        status: 'interested',
        message: message || ''
      });

    if (insertError) {
      throw insertError;
    }

    res.json({
      success: true,
      message: 'Thank you for choosing StudySync AI. We have received your interest in our premium plan. Our team will get back to you soon.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
