// ماسح باركود/QR باستخدام BarcodeDetector إن وُجد، وإلا إدخال يدوي
export async function scanBarcode({formats=['qr_code','code_128']} = {}) {
  if ('BarcodeDetector' in window) {
    try {
      const detector = new BarcodeDetector({ formats });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream; await video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      return await new Promise((resolve, reject)=>{
        const tick = async ()=>{
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            ctx.drawImage(video,0,0);
            const bitmap = await createImageBitmap(canvas);
            const codes = await detector.detect(bitmap);
            if (codes.length) {
              stream.getTracks().forEach(t=>t.stop());
              resolve(codes[0].rawValue);
              return;
            }
          }
          requestAnimationFrame(tick);
        };
        tick();
        setTimeout(()=>{ stream.getTracks().forEach(t=>t.stop()); reject(new Error('لم يتم العثور على باركود')); }, 15000);
      });
    } catch(e) {
      console.warn('BarcodeDetector غير متاح', e);
    }
  }
  const manual = prompt('أدخل/الصق كود الـSKU يدويًا:');
  if (!manual) throw new Error('لم يُدخل كود');
  return manual;
}
