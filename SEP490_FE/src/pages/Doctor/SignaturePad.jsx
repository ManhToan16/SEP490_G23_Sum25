import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./SignaturePad.scss";

const SignaturePad = ({ onSave }) => {
  const sigPad = useRef();

  const handleSave = () => {
    const dataURL = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(dataURL);
  };

  return (
    <div className="signature-pad">
      <SignatureCanvas ref={sigPad} canvasProps={{ width: 300, height: 100, className: 'sig-canvas' }} />
      <div className="sig-actions">
        <button onClick={() => sigPad.current.clear()}>Xoá</button>
        <button onClick={handleSave}>Lưu chữ ký</button>
      </div>
    </div>
  );
};

export default SignaturePad;
