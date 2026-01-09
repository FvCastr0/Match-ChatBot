const PrivacyPolicy = () => {
  const companyName = "Smatch Burger";
  const lastUpdated = "09/01/2026";
  const contactEmail = "contato.smatchburger@gmail.com";

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 font-sans text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="space-y-6">
        <p>
          This Privacy Policy describes how <strong>{companyName}</strong> we
          handles data when using its internal application integrated with the
          WhatsApp Cloud API provided by Meta Platforms, Inc.
        </p>

        <hr className="my-8" />

        <div>
          <h2 className="text-xl font-semibold mb-3">1. Application Scope</h2>
          <p>
            This application is an internal CRM tool, used exclusively by{" "}
            {companyName} for managing WhatsApp Business communications.
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>The application is not a public or consumer-facing product</li>
            <li>It is not offered to external users</li>
            <li>It does not provide user login via Facebook or Meta</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Data We Process</h2>
          <p>
            The application may process the following data strictly for business
            communication purposes:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>WhatsApp phone numbers</li>
            <li>Message content exchanged via WhatsApp</li>
            <li>Message metadata (timestamps, delivery status)</li>
          </ul>
          <p className="mt-2 italic">
            No sensitive personal data is collected beyond what is necessary to
            operate WhatsApp messaging.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. How Data Is Used</h2>
          <p>Data is used exclusively to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Send and receive WhatsApp messages</li>
            <li>Manage customer conversations</li>
            <li>Provide internal customer support operations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">
            4. Data Storage and Security
          </h2>
          <ul className="list-disc ml-6 mt-2">
            <li>All data is processed server-side</li>
            <li>Access is restricted to authorized company personnel</li>
            <li>No data is sold, shared, or transferred to third parties</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">
            5. Authentication and Tokens
          </h2>
          <p>
            This application uses a System User Access Token generated via Meta
            Business Manager to interact with the WhatsApp Cloud API.
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>No OAuth login is performed by end users</li>
            <li>No user access tokens are stored or refreshed</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
          <p>
            Data is shared only with Meta Platforms, Inc., strictly as required
            to operate WhatsApp Cloud API services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
          <p>
            Message data is retained only for the period required for internal
            business operations and compliance purposes.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact:
          </p>
          <p className="mt-2">
            📧 <strong>Email:</strong> {contactEmail}
          </p>
          <p>
            🏢 <strong>Company:</strong> {companyName}
          </p>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
