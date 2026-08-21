function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

      <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-between">

        {/* Left Side */}
        <div className="max-w-lg">

          <h1 className="text-5xl font-bold leading-tight">
            Discover Amazing Products
          </h1>

          <p className="mt-6 text-lg text-blue-100">
            Shop the latest fashion, electronics,
            jewelry and much more.
          </p>

          <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Now
          </button>

        </div>

        {/* Right Side */}
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
          alt="Shopping"
          className="w-96 rounded-xl shadow-2xl"
        />

      </div>

    </section>
  );
}

export default Hero;