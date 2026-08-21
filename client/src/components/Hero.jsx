
function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-12
          sm:py-16
          lg:py-24
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
            max-w-lg
            text-center
            md:text-left
          "
        >
          <h1
            className="
              text-4xl
              sm:text-5xl
              lg:text-6xl
              font-bold
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
              text-blue-100
              leading-relaxed
            "
          >
            Shop the latest fashion, electronics,
            jewelry and much more.
          </p>

          <button
            className="
              mt-7
              sm:mt-8
              bg-white
              text-blue-600
              px-7
              sm:px-8
              py-3
              rounded-lg
              font-semibold
              hover:bg-gray-100
              transition
              shadow-md
              hover:shadow-lg
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
              w-full
              max-w-xs
              sm:max-w-sm
              md:max-w-md
              lg:w-96
              rounded-xl
              shadow-2xl
              object-cover
            "
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
