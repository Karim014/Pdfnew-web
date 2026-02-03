
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { User } from '../types';

const CheckoutModal = ({ plan, onClose, onSuccess }: { plan: any, onClose: () => void, onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate bank auth
    setIsProcessing(false);
    setStep(2);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background-dark/95 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>

          {step === 1 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">Secure Checkout</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Plan: {plan.name}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{plan.name} Plan (Monthly)</span>
                  <span className="font-bold text-white">{plan.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Processing Fee</span>
                  <span className="font-bold text-green-500">Free</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-black text-white">Total</span>
                  <span className="font-black text-primary">{plan.price}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Card Details</label>
                   <div className="relative">
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-12 text-sm focus:ring-2 focus:ring-primary outline-none" />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">credit_card</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm outline-none" />
                  <input type="text" placeholder="CVV" className="h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                <span className="material-symbols-outlined text-green-500">verified_user</span>
                Payment is 256-bit SSL encrypted and 100% secure.
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-glow transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Authenticating...
                  </>
                ) : (
                  <>Complete Payment <span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 fade-in">
              <div className="size-24 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border-4 border-green-500/20">
                <span className="material-symbols-outlined text-6xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2">Success!</h3>
                <p className="text-slate-400 max-w-xs mx-auto">Your account has been upgraded to <b>{plan.name}</b>. All features are now unlocked.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const PricingPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleUpgradeSuccess = () => {
    if (selectedPlan) {
      // تحديث الخطة والرصيد بناءً على الخطة المختارة
      authService.updateUser({ 
        plan: selectedPlan.name as any, 
        credits: selectedPlan.credits, 
        maxCredits: selectedPlan.credits 
      });
      // Refresh user context
      authService.getCurrentUser().then(setUser);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      credits: 5,
      description: 'The standard entry point.',
      features: ['5 Credits / Month', 'Basic AI Summaries', '2 Files per Merge', 'Standard OCR', 'Community Support'],
      cta: 'Current Plan',
      highlight: false,
      disabled: true
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$8' : '$72',
      credits: 100,
      description: 'Power user toolkit for students.',
      features: ['100 Credits / Month', 'Advanced Gemini AI', 'Unlimited Merges', 'Batch OCR Processing', 'Pro Study Guides', 'Priority Support'],
      cta: 'Upgrade to Pro',
      highlight: true
    },
    {
      name: 'Premium',
      price: billingCycle === 'monthly' ? '$20' : '$180',
      credits: 500,
      description: 'Complete academic powerhouse.',
      features: ['500 Credits / Month', 'Personal AI Tutor', 'Early Access Features', 'Shared Workspace', 'Custom Learning Path', '24/7 VIP Support'],
      cta: 'Get Premium',
      highlight: false
    }
  ];

  const comparisons = [
    { feature: 'Monthly Credits', free: '5', pro: '100', premium: '500' },
    { feature: 'AI Accuracy', free: 'Standard', pro: 'High (Flash)', premium: 'Max (Pro)' },
    { feature: 'OCR Batch size', free: '1 File', pro: '10 Files', premium: 'Unlimited' },
    { feature: 'Storage', free: '100MB', pro: '10GB', premium: 'Unlimited' },
    { feature: 'Collaboration', free: '-', pro: 'View Only', premium: 'Full Admin' },
  ];

  return (
    <div className="min-h-full bg-background-dark pb-32">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pricing & Plans</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Invest in Your <span className="text-primary italic">Education.</span></h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            Stop wasting time on manual formatting. Unlock StudyFlow's full AI potential and boost your productivity today.
          </p>

          <div className="flex items-center justify-center gap-4 bg-surface-dark p-1.5 rounded-2xl border border-white/5 w-fit mx-auto">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
            >
              Yearly <span className="text-[9px] bg-green-500/20 text-green-500 px-1.5 rounded-md">-25%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans Cards */}
      <section className="px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => {
            const isCurrent = user?.plan === plan.name;
            return (
              <motion.div 
                key={plan.name}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 ${plan.highlight ? 'border-primary bg-primary/5 shadow-2xl z-10' : 'border-white/5 bg-surface-dark/60'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-glow">Recommended</div>
                )}
                <div className="mb-10">
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                </div>
                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-6xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500 font-bold">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  disabled={isCurrent || plan.disabled}
                  className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mb-10 flex items-center justify-center gap-2 ${isCurrent ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' : plan.highlight ? 'bg-primary text-white shadow-glow hover:scale-105 active:scale-95' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  {isCurrent ? <><span className="material-symbols-outlined">check_circle</span> Active Plan</> : plan.cta}
                </button>
                <div className="flex-1 space-y-5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">What's included</p>
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 mt-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-black mb-16">Compare Feature Depth</h2>
          <div className="rounded-[2.5rem] bg-surface-dark/40 border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Feature</th>
                  <th className="p-6 text-center text-xs font-black">Free</th>
                  <th className="p-6 text-center text-xs font-black text-primary">Pro</th>
                  <th className="p-6 text-center text-xs font-black">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisons.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-sm font-bold text-slate-400">{row.feature}</td>
                    <td className="p-6 text-center text-xs text-slate-500 font-medium">{row.free}</td>
                    <td className="p-6 text-center text-xs text-white font-black">{row.pro}</td>
                    <td className="p-6 text-center text-xs text-slate-500 font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="px-6 mt-32 text-center">
        <div className="max-w-4xl mx-auto p-12 rounded-[3rem] border border-white/5 bg-gradient-to-br from-surface-dark to-background-dark shadow-2xl">
          <h3 className="text-2xl font-black mb-8">Secure & Private Learning</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { icon: 'shield_lock', title: 'SSL Encrypted', desc: 'Bank-level security' },
              { icon: 'lock', title: 'Private Data', desc: 'No AI data sharing' },
              { icon: 'credit_score', title: 'Secure Pay', desc: 'Stripe Verified' },
              { icon: 'verified', title: 'Uptime', desc: '99.9% Reliable' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <span className="material-symbols-outlined text-primary text-4xl">{item.icon}</span>
                <p className="text-[10px] font-black uppercase tracking-widest">{item.title}</p>
                <p className="text-[10px] text-slate-500 font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-wrap justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="PayPal" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Stripe_logo%2C_revised_2009.svg" className="h-6" alt="Stripe" />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPlan && (
          <CheckoutModal 
            plan={selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
            onSuccess={handleUpgradeSuccess} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
