const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY); // Thay bằng API key thật

resend.emails.send({
  from: 'duyanhdeptraivcllll@vuduyanh.id.vn', // Thay bằng email đã verify trên Resend
  to: 'duyanh19122k3@gmail.com',              // Thay bằng email bạn muốn nhận
  subject: 'Test Email from Resend',
  html: '<b>Hello from Resend!</b>',
})
.then((res) => {
  console.log('Send result:', res);
})
.catch((err) => {
  console.error('Send error:', err);
});