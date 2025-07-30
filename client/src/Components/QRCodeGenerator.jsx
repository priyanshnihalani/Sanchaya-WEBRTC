import QRCode from 'react-qr-code';


function QRCodeGenerator({ value }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <QRCode
                    value={value}
                    size={256}
                    bgColor="#ffffff"
                    fgColor="#000"
                    imageRendering={"/logo.svg"}
                    level="H"
                />
            </div>
        </>
    )
}

export default QRCodeGenerator;