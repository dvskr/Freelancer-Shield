# FreelancerShield Production Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] All required environment variables set in Vercel
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] DATABASE_URL points to production database
- [ ] Supabase production keys configured
- [ ] Stripe live keys configured (not test keys!)
- [ ] Resend API key configured
- [ ] CRON_SECRET set for scheduled jobs

### Database
- [ ] Production database created
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Database backups configured
- [ ] Connection pooling enabled

### Stripe
- [ ] Stripe account verified and live
- [ ] Webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Webhook events subscribed (checkout.session.completed, payment_intent.succeeded, etc.)

### Email
- [ ] Sending domain verified in Resend
- [ ] SPF/DKIM records configured
- [ ] Email templates tested

## Deployment Steps

1. **Run Pre-Deployment Checks**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify Health Check**
   ```bash
   curl https://yourdomain.com/api/health
   ```

5. **Test Critical Flows**
   - [ ] User registration
   - [ ] Login/logout
   - [ ] Create client
   - [ ] Create invoice
   - [ ] Process payment
   - [ ] Client portal access

## Post-Deployment

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Uptime monitoring set up

### Security
- [ ] SSL certificate active
- [ ] Security headers verified
- [ ] Rate limiting active

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

## Rollback Procedure

If issues occur:
1. Revert to previous deployment in Vercel
2. Rollback database if needed
3. Notify team and document issue
