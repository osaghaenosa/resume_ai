import React from "react";
import { Helmet } from "react-helmet";

export default function Terms() {
  return (
    <>
      <Helmet>
          <title>Terms and Conditions | Job Ready AI Tool</title>
          <meta
          name="description"
          content="Terms and Conditions."
          />
          <meta
          name="keywords"
          content="Terms and Conditions."
          />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Job Ready AI Tool" />
          <link rel="canonical" href="https://jobreadyai.xyz/terms" />
      </Helmet>
      <div className="legal-page">
        <h1>Terms and Conditions</h1>
      <p>
        Welcome to JobReadyAI. By accessing or using this website, you agree to
        comply with these Terms and Conditions.
      </p>

      <p>
        JobReadyAI provides AI-powered tools for job preparation, CV optimization,
        interview practice, and career guidance.
      </p>

      <p>
        You agree not to misuse the platform, attempt unauthorized access, or
        violate any applicable laws.
      </p>

      <p>
        We reserve the right to update or discontinue services at any time.
      </p>

      <h3>Contact Information</h3>
      <p>
        Email: support@jobreadyai.xyz <br />
        Phone: +234903025188 <br />
        Address: Lagos, Nigeria.
      </p>
    </div>
    </>
  );
}
