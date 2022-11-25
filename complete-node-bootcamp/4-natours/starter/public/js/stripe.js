const stripe = Stripe(
  'pk_test_51M7jIGJLlXijdSgfv4Bum9lQ1xd4hwdLDVDYDqdfVFzoE2ACytJkewI0A8NDwrsR5seLXPaYG0ApW51a6ypgEw7Y00hJqWS2Je'
);

const bookTour = async (tourId) => {
  try {
    // 1) get checkout session.
    const res = await fetch(
      `http://172.22.125.59:8080/api/v1/bookings/checkout-session/${tourId}`
    );
    if (res.status === 200) {
      const data = await res.json();
      console.log('session', data);
      // 2) create checkout form.
      await stripe.redirectToCheckout({
        sessionId: data.session.id,
      });
    }
  } catch (e) {
    console.log(e.message);
  }
};

const bookBtn = document.getElementById('book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; // 'tour-id' gets converted to 'tourId'.
    if (tourId) {
      const res = await bookTour(tourId);
      console.log('res', res);
    }
    e.target.textContent = 'Book Tour Now!';
  });
}
