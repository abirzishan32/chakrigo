import React from "react";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Terms and Conditions
                    </h1>
                    <p className="text-sm text-gray-500">Last Updated: December 17, 2024</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
                        
                        {/* Section 1 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                Welcome to ChakriGO. By accessing or using our website and services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our services.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you and ChakriGO. We reserve the right to update these Terms at any time, and your continued use of our services constitutes acceptance of any modifications.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Services</h2>
                            <p className="mb-4">
                                ChakriGO provides AI-powered interview preparation services, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Mock interview simulations with AI</li>
                                <li>Performance analytics and feedback</li>
                                <li>Resume analysis and optimization</li>
                                <li>Career guidance and roadmap generation</li>
                                <li>System design practice and visualization</li>
                                <li>Algorithm visualization and practice</li>
                                <li>Skill assessments and evaluations</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">3.1 Account Creation:</strong> You must create an account to access certain features. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                                </p>
                                <p>
                                    <strong className="text-white">3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                                </p>
                                <p>
                                    <strong className="text-white">3.3 Email Verification:</strong> You must verify your email address to access our services. Failure to verify your email may result in limited access to features.
                                </p>
                                <p>
                                    <strong className="text-white">3.4 Age Requirement:</strong> You must be at least 16 years of age to use our services. By using ChakriGO, you represent and warrant that you meet this age requirement.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. User Conduct and Responsibilities</h2>
                            <p className="mb-4">You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Use the service for any illegal purpose or in violation of any laws</li>
                                <li>Violate the intellectual property rights of others</li>
                                <li>Upload malicious code, viruses, or any harmful content</li>
                                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                                <li>Interfere with or disrupt the service or servers</li>
                                <li>Use automated systems (bots, scripts) without our written permission</li>
                                <li>Share your account credentials with others</li>
                                <li>Impersonate any person or entity</li>
                                <li>Harass, abuse, or harm other users</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Intellectual Property Rights</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">5.1 Our Content:</strong> All content on ChakriGO, including text, graphics, logos, images, audio clips, software, and AI-generated content, is the property of ChakriGO or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                                </p>
                                <p>
                                    <strong className="text-white">5.2 Your Content:</strong> You retain ownership of content you submit (resumes, responses, etc.). By submitting content, you grant ChakriGO a worldwide, non-exclusive, royalty-free license to use, reproduce, and analyze your content solely for the purpose of providing and improving our services.
                                </p>
                                <p>
                                    <strong className="text-white">5.3 AI-Generated Content:</strong> Content generated by our AI systems based on your input is provided for your personal use. You may use this content for interview preparation purposes but may not resell or redistribute it commercially.
                                </p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">6. Privacy and Data Protection</h2>
                            <p>
                                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using ChakriGO, you consent to our collection and use of your information as described in the Privacy Policy.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">7. Payment and Subscriptions</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">7.1 Fees:</strong> Certain features may require payment. All fees are in the currency specified at the time of purchase and are non-refundable unless otherwise stated.
                                </p>
                                <p>
                                    <strong className="text-white">7.2 Billing:</strong> By providing payment information, you authorize us to charge the applicable fees to your payment method. You are responsible for keeping your payment information current.
                                </p>
                                <p>
                                    <strong className="text-white">7.3 Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period.
                                </p>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">8. Disclaimers and Limitations of Liability</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">8.1 Service "As Is":</strong> ChakriGO is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.
                                </p>
                                <p>
                                    <strong className="text-white">8.2 No Professional Advice:</strong> Our AI-powered feedback and guidance are for informational purposes only and should not be considered professional career counseling or guarantee of employment.
                                </p>
                                <p>
                                    <strong className="text-white">8.3 Limitation of Liability:</strong> To the fullest extent permitted by law, ChakriGO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                                </p>
                                <p>
                                    <strong className="text-white">8.4 Third-Party Services:</strong> We may integrate with third-party services (e.g., Firebase, Google OAuth). We are not responsible for the availability or functionality of these third-party services.
                                </p>
                            </div>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">9. Indemnification</h2>
                            <p>
                                You agree to indemnify, defend, and hold harmless ChakriGO, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising out of your use of the service, violation of these Terms, or infringement of any third-party rights.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">10. Termination</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">10.1 By You:</strong> You may terminate your account at any time by contacting our support team or using the account deletion feature.
                                </p>
                                <p>
                                    <strong className="text-white">10.2 By Us:</strong> We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any other reason we deem appropriate.
                                </p>
                                <p>
                                    <strong className="text-white">10.3 Effect of Termination:</strong> Upon termination, your right to use the service will immediately cease. We may retain certain information as required by law or for legitimate business purposes.
                                </p>
                            </div>
                        </section>

                        {/* Section 11 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">11. Dispute Resolution</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">11.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                                </p>
                                <p>
                                    <strong className="text-white">11.2 Arbitration:</strong> Any dispute arising out of or relating to these Terms or the service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court.
                                </p>
                                <p>
                                    <strong className="text-white">11.3 Class Action Waiver:</strong> You agree to resolve disputes with ChakriGO on an individual basis and waive any right to participate in a class action lawsuit.
                                </p>
                            </div>
                        </section>

                        {/* Section 12 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">12. Modifications to Service</h2>
                            <p>
                                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
                            </p>
                        </section>

                        {/* Section 13 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">13. General Provisions</h2>
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">13.1 Entire Agreement:</strong> These Terms constitute the entire agreement between you and ChakriGO regarding the use of our services.
                                </p>
                                <p>
                                    <strong className="text-white">13.2 Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                                </p>
                                <p>
                                    <strong className="text-white">13.3 Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
                                </p>
                                <p>
                                    <strong className="text-white">13.4 Assignment:</strong> You may not assign or transfer these Terms without our written consent. We may assign our rights and obligations without restriction.
                                </p>
                            </div>
                        </section>

                        {/* Section 14 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">14. Contact Information</h2>
                            <p className="mb-4">
                                If you have any questions about these Terms and Conditions, please contact us at:
                            </p>
                            <div className="bg-gray-900/30 p-4 rounded border border-gray-800">
                                <p className="font-semibold text-white mb-2">ChakriGO Support</p>
                                <p>Email: support@chakrigo.com</p>
                                <p>Website: www.chakrigo.com</p>
                            </div>
                        </section>

                        {/* Acknowledgment */}
                        <section className="border-t border-gray-800 pt-6">
                            <p className="text-xs text-gray-500 italic">
                                By using ChakriGO, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

    );
}
