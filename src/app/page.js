import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Nanoneuro Systems</title>
        <meta name="description" content="A deeptech startup for building the future of energy-efficient semiconductors." />
        <meta property="og:title" content="Nanoneuro Systems" />
        <meta property="og:description" content="Building the future of energy efficient semiconductors. We are looking for MSE, EE, or BE major cofounders." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="text-center max-w-lg mb-10">
          <h1 className="text-pink-500 font-bold text-5xl mb-10">
            Nanoneuro Systems
          </h1>
          <h2 className="text-stone-200 font-bold text-2xl mb-10">
            A deeptech startup for building the future<br /> of energy-efficient semiconductors.
          </h2>
          <h2 className="text-stone-200 font-bold text-1xl mb-10">
            Looking for MSE, EE, or BE major cofounders.<br />
            If you&apos;re interested, <a className="hover:text-pink-500 underline transition duration-200" href="mailto:myung11@seas.upenn.edu">email us</a>.
          </h2>
        </div>
      </div>
    </>
  );
}
