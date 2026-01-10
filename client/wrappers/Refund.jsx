import React from "react";
import { Helmet } from "react-helmet";
export default function Refund() {
  return (
    <>
      <Helmet>
          <title>Refund Policy | Job Ready AI Tool</title>
          <meta
          name="description"
          content="Refund Policy."
          />
          <meta
          name="keywords"
          content="Refund Policy."
          />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Job Ready AI Tool" />
          <link rel="canonical" href="https://jobreadyai.xyz/refund" />
      </Helmet>
      <div className="legal-page">
        <h1>Refund Policy</h1>

        <p>
          JobReadyAI offers digital subscription-based services. Once access is
          granted, refunds are generally not provided.
        </p>

        <p>
          Refunds may be considered in cases of duplicate payment or technical
          errors.
        </p>

        <p>
          Refund requests must be submitted within 7 days of payment by emailing
          jobreadyai@gmail.com.
        </p>
      </div>
    </>
  );
}
