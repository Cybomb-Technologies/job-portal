import React, { useState } from 'react';
import { Check, X, HelpCircle, Star, Zap, Shield, Briefcase, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const plans = [
        {
            name: "Free",
            price: 0,
            description: "Perfect for getting started and trying out our platform.",
            features: [
                "1 Job Posting per month",
                "Basic Candidate Search",
                "Standard Support",
                "7-day listing duration",
                "Company Profile"
            ],
            notIncluded: [
                "Featured Job Listings",
                "Advanced Filtering",
                "Dedicated Account Manager",
                "Applicant Tracking System"
            ],
            cta: "Get Started",
            ctaLink: "/signup",
            popular: false
        },
        {
            name: "Pro",
            price: isAnnual ? 2999 : 3499,
            description: "For growing companies that need to hire the best talent fast.",
            features: [
                "Unlimited Job Postings",
                "Advanced Candidate Search",
                "Priority Support",
                "30-day listing duration",
                "Verified Company Badge",
                "Featured Job Listings",
                "Applicant Tracking System",
                "Access to Analytics"
            ],
            notIncluded: [],
            cta: "Go Pro",
            ctaLink: "/signup?plan=pro",
            popular: true
        }
    ];

    const faqs = [
        {
            question: "Can I cancel my subscription at any time?",
            answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway."
        },
        {
            question: "Do you offer refunds?",
            answer: "We offer a 7-day money-back guarantee if you're not satisfied with our Pro plan. No questions asked."
        },
        {
            question: "What is a Verified Company Badge?",
            answer: "The Verified Company Badge adds credibility to your profile, showing candidates that your company is legitimate and trusted."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
             {/* Decorative Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl -mr-20 -mt-20 -z-10 pointer-events-none"></div>
            <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl -ml-20 -z-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 py-24">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 animate-fadeIn relative z-10">
                    <h2 className="text-blue-600 font-extrabold tracking-wide uppercase text-sm mb-4">Pricing Plans</h2>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 font-display tracking-tight leading-tight">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                        Choose the perfect plan for your recruitment needs. <br className="hidden md:inline"/> No hidden fees. Just results.
                    </p>
                    
                    {/* Toggle */}
                    <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200 relative">
                        <div className="absolute -top-3 -right-3 pointer-events-none z-20">
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-bounce flex items-center">
                                SAVE 20%
                            </span>
                        </div>
                        <button 
                            onClick={() => setIsAnnual(false)}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isAnnual ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setIsAnnual(true)}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isAnnual ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24 relative z-10">
                    {plans.map((plan, index) => (
                        <div 
                            key={index} 
                            className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 border transition-all duration-300 flex flex-col group ${
                                plan.popular 
                                ? 'border-blue-600 shadow-2xl shadow-blue-900/10 scale-105 z-20 ring-4 ring-blue-50' 
                                : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="mb-8 text-center">
                                <h3 className={`text-2xl font-bold mb-3 ${plan.popular ? 'text-blue-600' : 'text-slate-900'} font-display`}>{plan.name}</h3>
                                <p className="text-slate-500 mb-8 min-h-[50px] font-medium leading-relaxed">{plan.description}</p>
                                <div className="flex items-baseline justify-center text-slate-900">
                                    <span className="text-5xl font-extrabold tracking-tighter">
                                        ₹{plan.price === 0 ? '0' : plan.price.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 ml-1.5 font-bold text-lg">/ month</span>
                                </div>
                                {isAnnual && plan.price > 0 && (
                                    <p className="text-sm text-emerald-600 font-bold mt-3 bg-emerald-50 py-1 px-3 rounded-full inline-block">Billed ₹{(plan.price * 12).toLocaleString()} yearly</p>
                                )}
                            </div>

                            <button 
                                onClick={() => {
                                    if (user) {
                                        if (plan.name === "Free") {
                                            navigate('/employer/dashboard');
                                        } else {
                                            Swal.fire({
                                                title: 'Upgrade to Pro',
                                                text: `Proceed to payment of ₹${plan.price.toLocaleString()}?`,
                                                icon: 'question',
                                                showCancelButton: true,
                                                confirmButtonColor: '#2563EB',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, Upgrade!',
                                                customClass: {
                                                    popup: 'rounded-[2rem]',
                                                    confirmButton: 'rounded-xl',
                                                    cancelButton: 'rounded-xl'
                                                }
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    Swal.fire({
                                                        title: 'Success!',
                                                        text: 'Your account has been upgraded to Pro.',
                                                        icon: 'success',
                                                        confirmButtonColor: '#2563EB',
                                                        customClass: {
                                                            popup: 'rounded-[2rem]',
                                                            confirmButton: 'rounded-xl'
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        navigate(plan.ctaLink);
                                    }
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-lg text-center transition-all active:scale-95 mb-10 ${
                                    plan.popular 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300' 
                                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                }`}
                            >
                                {plan.cta}
                            </button>

                            <div className="flex-grow space-y-5">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What's included</div>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 group/item">
                                        <div className={`p-1 rounded-full mt-0.5 shrink-0 transition-colors ${plan.popular ? 'bg-blue-100 text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white' : 'bg-slate-100 text-slate-400 group-hover/item:bg-slate-800 group-hover/item:text-white'}`}>
                                            <Check className="w-3 h-3" strokeWidth={4} />
                                        </div>
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 opacity-40">
                                        <div className="p-1 bg-slate-50 rounded-full mt-0.5 shrink-0">
                                            <X className="w-3 h-3 text-slate-400" strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-500 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto mb-24">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-16 font-display">Everything you need to hire</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Fast Hiring</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">Our advanced algorithms match your job posts with the most relevant candidates instantly, reducing your time-to-hire.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Verified Profiles</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">We verify candidates and companies meticulously to ensure a 100% safe and trustworthy hiring environment for you.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 text-violet-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Quality Candidates</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">Access a vast database of pre-vetted skilled professionals across various industries and experience levels.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-slate-900 font-display mb-4">Frequently Asked Questions</h2>
                         <p className="text-slate-500">Have questions? We're here to help.</p>
                    </div>
                   
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-4">
                                    <div className="mt-1 shrink-0 p-1 bg-blue-50 text-blue-600 rounded-lg">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    {faq.question}
                                </h3>
                                <p className="text-slate-600 ml-12 leading-relaxed font-medium text-base">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Pricing;
