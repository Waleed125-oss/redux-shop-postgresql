
function Hero() {
  const handleShopNow = () => {
    const productsSection = document.getElementById("shop-products");

    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.35),_transparent_38%)]" />
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-14
          sm:py-20
          lg:py-28
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-10
          lg:gap-16
        "
      >
        {/* ============================================
            LEFT SIDE
        ============================================ */}

        <div
          className="
            w-full
            md:w-1/2
          relative
          z-10
          max-w-xl
            text-center
            md:text-left
          "
        >
          <h1
            className="
              text-4xl
              sm:text-5xl
              lg:text-6xl
              font-extrabold
              tracking-tight
              leading-tight
            "
          >
            Discover Amazing Products
          </h1>

          <p
            className="
              mt-5
              sm:mt-6
              text-base
              sm:text-lg
              text-blue-100/90
              leading-relaxed
            "
          >
            Shop the latest fashion, electronics,
            jewelry and much more.
          </p>

          <button
            onClick={handleShopNow}
            className="
              mt-7
              sm:mt-8
              bg-white
              text-blue-600
              px-7
              sm:px-8
              py-3
              rounded-xl
              font-semibold
              hover:bg-gray-100
              transition
              shadow-lg
              shadow-blue-950/30
              hover:-translate-y-0.5
              hover:shadow-xl
            "
          >
            Shop Now
          </button>
        </div>

        {/* ============================================
            RIGHT SIDE
        ============================================ */}

        <div
          className="
            w-full
            md:w-1/2
            flex
            justify-center
            md:justify-end
          "
        >
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
            alt="Shopping"
            className="
              relative
              z-10
              w-full
              max-w-xs
              sm:max-w-sm
              md:max-w-md
              lg:w-96
              rounded-3xl
              border
              border-white/15
              shadow-2xl
              shadow-blue-950/40
              object-cover
            "
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
