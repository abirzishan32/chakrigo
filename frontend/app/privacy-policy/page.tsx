import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500">Last Updated: December 17, 2024</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
                        
                        {/* Introduction */}
                        <section>
                            <p className="text-lg mb-4">
                                At ChakriGO, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered interview preparation platform. Please read this policy carefully.
                            </p>
                            <p>
                                By using ChakriGO, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                            </p>
                        </section>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-300 mb-2">1.1 Information You Provide to Us</h3>
                                    <p className="mb-2">We collect information that you voluntarily provide when you:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong className="text-white">Create an Account:</strong> Name, email address, password, and profile information</li>
                                        <li><strong className="text-white">Use Our Services:</strong> Resume content, interview responses, skill assessment answers, career goals, and preferences</li>
                                        <li><strong className="text-white">Contact Us:</strong> Communication preferences, support inquiries, and feedback</li>
                                        <li><strong className="text-white">Payment Information:</strong> Billing details (processed securely through third-party payment processors)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-gray-300 mb-2">1.2 Information Collected Automatically</h3>
                                    <p className="mb-2">When you use ChakriGO, we automatically collect:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong className="text-white">Usage Data:</strong> Features used, time spent on platform, interaction patterns, and performance metrics</li>
                                        <li><strong className="text-white">Device Information:</strong> IP address, browser type, operating system, device identifiers, and mobile network information</li>
                                        <li><strong className="text-white">Cookies and Tracking:</strong> Session data, preferences, and analytics information (see Section 6)</li>
                                        <li><strong className="text-white">Log Data:</strong> Access times, pages viewed, and error logs</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-gray-300 mb-2">1.3 Information from Third Parties</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong className="text-white">Authentication Providers:</strong> When you sign in with Google or other OAuth providers, we receive your name, email, and profile picture</li>
                                        <li><strong className="text-white">Firebase Services:</strong> Analytics and authentication data through Google Firebase</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
                            <p className="mb-4">We use your information for the following purposes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Provide Services:</strong> Deliver interview simulations, feedback, resume analysis, and career guidance</li>
                                <li><strong className="text-white">Personalization:</strong> Customize your experience based on your skills, goals, and performance</li>
                                <li><strong className="text-white">AI Model Training:</strong> Improve our AI algorithms and recommendation systems (anonymized data only)</li>
                                <li><strong className="text-white">Communication:</strong> Send account notifications, service updates, and promotional materials (with your consent)</li>
                                <li><strong className="text-white">Analytics:</strong> Understand usage patterns, measure effectiveness, and improve our platform</li>
                                <li><strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                                <li><strong className="text-white">Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
                                <li><strong className="text-white">Customer Support:</strong> Respond to your inquiries and provide technical assistance</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">3. How We Share Your Information</h2>
                            <p className="mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
                            
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">3.1 Service Providers:</strong> We share data with third-party vendors who perform services on our behalf (hosting, analytics, payment processing, email delivery). These providers are contractually obligated to protect your data.
                                </p>
                                <p>
                                    <strong className="text-white">3.2 Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                                </p>
                                <p>
                                    <strong className="text-white">3.3 Legal Requirements:</strong> We may disclose information when required by law, subpoena, or to protect our rights, property, or safety.
                                </p>
                                <p>
                                    <strong className="text-white">3.4 With Your Consent:</strong> We may share information for any other purpose with your explicit consent.
                                </p>
                                <p>
                                    <strong className="text-white">3.5 Aggregated Data:</strong> We may share anonymized, aggregated data that does not identify you personally for research and analytics purposes.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">4. Data Security</h2>
                            <p className="mb-4">We implement industry-standard security measures to protect your information:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                                <li>Secure authentication via Firebase Authentication with email verification</li>
                                <li>Regular security audits and vulnerability assessments</li>
                                <li>Access controls and authentication for internal systems</li>
                                <li>Secure cloud infrastructure (Firebase, Google Cloud Platform)</li>
                            </ul>
                            <p className="mt-4 text-yellow-400">
                                However, no method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
                            <p className="mb-4">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Account Data:</strong> Retained while your account is active and for a reasonable period after deletion</li>
                                <li><strong className="text-white">Usage Data:</strong> Typically retained for 12-24 months for analytics purposes</li>
                                <li><strong className="text-white">Legal Records:</strong> Retained as required by applicable laws and regulations</li>
                            </ul>
                            <p className="mt-4">
                                You may request deletion of your account and associated data at any time (see Section 8).
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies and Tracking Technologies</h2>
                            <p className="mb-4">We use cookies and similar tracking technologies to enhance your experience:</p>
                            
                            <div className="space-y-3">
                                <p>
                                    <strong className="text-white">Essential Cookies:</strong> Required for authentication, security, and basic functionality
                                </p>
                                <p>
                                    <strong className="text-white">Analytics Cookies:</strong> Help us understand how you use our platform (Google Analytics, Firebase Analytics)
                                </p>
                                <p>
                                    <strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences
                                </p>
                            </div>

                            <p className="mt-4">
                                You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">7. Third-Party Services</h2>
                            <p className="mb-4">ChakriGO integrates with third-party services that have their own privacy policies:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Firebase (Google):</strong> Authentication, database, and analytics services</li>
                                <li><strong className="text-white">Google OAuth:</strong> Third-party sign-in functionality</li>
                                <li><strong className="text-white">Payment Processors:</strong> Secure payment handling (we do not store full credit card information)</li>
                            </ul>
                            <p className="mt-4">
                                We recommend reviewing the privacy policies of these third-party services to understand their data practices.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">8. Your Privacy Rights</h2>
                            <p className="mb-4">Depending on your location, you may have the following rights:</p>
                            
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Access:</strong> Request a copy of the personal information we hold about you</li>
                                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                                <li><strong className="text-white">Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                                <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                                <li><strong className="text-white">Restriction:</strong> Request restriction of processing in certain circumstances</li>
                                <li><strong className="text-white">Object:</strong> Object to processing based on legitimate interests</li>
                            </ul>

                            <p className="mt-4">
                                To exercise these rights, please contact us at privacy@chakrigo.com. We will respond within the timeframe required by applicable law.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">9. Children's Privacy</h2>
                            <p>
                                ChakriGO is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately and we will take steps to delete such information.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">10. International Data Transfers</h2>
                            <p>
                                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from your jurisdiction. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">11. California Privacy Rights (CCPA)</h2>
                            <p className="mb-4">
                                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Right to know what personal information is collected, used, shared, or sold</li>
                                <li>Right to delete personal information (with certain exceptions)</li>
                                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                                <li>Right to non-discrimination for exercising your CCPA rights</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, email privacy@chakrigo.com with "CCPA Request" in the subject line.
                            </p>
                        </section>

                        

                        {/* Section 12 */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-3">12. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of ChakriGO after changes are posted constitutes acceptance of the updated Privacy Policy.
                            </p>
                        </section>


                        {/* Acknowledgment */}
                        <section className="border-t border-gray-800 pt-6">
                            <p className="text-xs text-gray-500 italic">
                                By using ChakriGO, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

    );
}
