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
        <div className="min-h-screen bg-gray-50/50 py-12 md:py-20">
            <div className="container mx-auto px-4">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeIn">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                        Choose the plan that fits your hiring needs. No hidden fees.
                    </p>
                    
                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                        <button 
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`w-14 h-8 flex items-center bg-gray-200 rounded-full p-1 transition-all duration-300 ${isAnnual ? 'bg-[#4169E1]' : ''}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : ''}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                            Yearly <span className="text-[#4169E1] text-xs bg-blue-50 px-2 py-0.5 rounded-full ml-1">-20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {plans.map((plan, index) => (
                        <div 
                            key={index} 
                            className={`relative bg-white rounded-3xl p-8 border hover:shadow-xl transition-shadow duration-300 flex flex-col ${plan.popular ? 'border-[#4169E1] shadow-lg scale-105 z-10' : 'border-gray-200'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#4169E1] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 mb-6 min-h-[50px]">{plan.description}</p>
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-extrabold text-gray-900">
                                        ₹{plan.price === 0 ? '0' : plan.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 ml-2 font-medium">/ month</span>
                                </div>
                                {isAnnual && plan.price > 0 && (
                                    <p className="text-xs text-[#4169E1] font-bold mt-2">Billed ₹{(plan.price * 12).toLocaleString()} yearly</p>
                                )}
                            </div>

                            <div className="flex-grow space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="p-1 bg-green-50 rounded-full mt-0.5 shrink-0">
                                            <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 opacity-50">
                                        <div className="p-1 bg-gray-100 rounded-full mt-0.5 shrink-0">
                                            <X className="w-3 h-3 text-gray-400" strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-500">{feature}</span>
                                    </div>
                                ))}
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
                                                confirmButtonColor: '#4169E1',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, Upgrade!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    Swal.fire(
                                                        'Success!',
                                                        'Your account has been upgraded to Pro.',
                                                        'success'
                                                    );
                                                }
                                            });
                                        }
                                    } else {
                                        navigate(plan.ctaLink);
                                    }
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-lg text-center transition-all ${
                                    plan.popular 
                                    ? 'bg-[#4169E1] text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to hire</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-[#4169E1]">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Hiring</h3>
                            <p className="text-gray-600">Our advanced algorithms match your job posts with the most relevant candidates instantly.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Profiles</h3>
                            <p className="text-gray-600">We verify candidates and companies to ensure a safe and trustworthy hiring environment.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Candidates</h3>
                            <p className="text-gray-600">Access a database of skilled professionals across various industries and experience levels.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-[#4169E1] mt-0.5 shrink-0" />
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 ml-8 leading-relaxed">
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
