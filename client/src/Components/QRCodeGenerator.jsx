import QRCode from "react-qr-code";

function QRCodeGenerator({ value }) {

  const qrValue =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
        position: "relative",
        display: "inline-block"
      }}
    >
      <QRCode
        value={qrValue}
        size={256}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
      />

    </div>
  );
}

export default QRCodeGenerator;