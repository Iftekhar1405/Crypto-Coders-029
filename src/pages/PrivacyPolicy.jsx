// src/pages/PrivacyPolicy.jsx
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">
        Privacy Policy for Weekend Planner
      </h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          Welcome to Weekend Planner. We are committed to protecting your
          personal information and your right to privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Information We Collect
        </h2>
        <p>
          We collect personal information that you provide to us such as name,
          email address, and other contact information. We also collect
          information automatically when you use the application, including
          usage data and device information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. How We Use Your Information
        </h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, to communicate with you, and to comply with legal
          obligations. We may also use your information to personalize your
          experience and to send you promotional communications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Data Storage and Security
        </h2>
        <p>
          We implement a variety of security measures to maintain the safety of
          your personal information. Your personal information is contained
          behind secured networks and is only accessible by a limited number of
          persons who have special access rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p>
          You have the right to access, update, or delete the information we
          have on you. You can object to processing of your personal
          information, ask us to restrict processing of your personal
          information or request portability of your personal information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          6. Changes to This Policy
        </h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at support@weekendplanner.com.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
