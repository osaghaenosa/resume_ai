import React, { useEffect } from "react";

// First banner (container-based)
const AdsterraBanner: React.FC = () => {
  useEffect(() => {
    const existingScript = document.getElementById("adsterra-script-33a3f2a");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "adsterra-script-33a3f2a";
    script.src =
      "//pl27574382.revenuecpmgate.com/33a3f2a6653908ce232ef281451c50f8/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    const container = document.getElementById(
      "container-33a3f2a6653908ce232ef281451c50f8"
    );
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, []);

  return <div id="container-33a3f2a6653908ce232ef281451c50f8" />;
};

export default AdsterraBanner; // 👈 default export here

// Optional extra export
export const AdsterraIframeBanner: React.FC = () => {
  useEffect(() => {
    const oldInline = document.getElementById("adsterra-inline-b3ae6b0");
    const oldScript = document.getElementById("adsterra-script-b3ae6b0");
    if (oldInline) oldInline.remove();
    if (oldScript) oldScript.remove();

    const inlineScript = document.createElement("script");
    inlineScript.id = "adsterra-inline-b3ae6b0";
    inlineScript.type = "text/javascript";
    inlineScript.innerHTML = `
      atOptions = {
        'key' : 'f9069347f90478a98ec1f9f0c34ea048',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    document.body.appendChild(inlineScript);

    const script = document.createElement("script");
    script.id = "adsterra-script-b3ae6b0";
    script.type = "text/javascript";
    script.src =
      "//www.highperformanceformat.com/b3ae6b053601e019084d50935f52c2fa/invoke.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      inlineScript.remove();
      script.remove();
    };
  }, []);

  return <div className="myads"><div  id="adsterra-iframe-container" /></div>;
};