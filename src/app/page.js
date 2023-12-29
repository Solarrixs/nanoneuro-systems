import {User} from "@nextui-org/user";
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="text-center max-w-lg">
          <Image
            src="/image.webp"
            height={500}
            width={500}
            alt="Nanoneuro Logo"
          />
          <h2 className="text-stone-200 font-bold text-2xl mb-8">
            building the future of energy<br /> efficient semiconductors
          </h2>
          <User
            className="mb-32"
            name="Maxx Yung"
            description="Founder"
            avatarProps={{
              src: "/headshot.webp"
            }}
          />
        </div>
        <h2 className="text-stone-200 font-bold text-1xl mb-4 text-center">
            looking for MSE, EE, or BE major cofounders<br />
            if you&apos;re interested, <a className="hover:text-nanoPurple underline transition duration-200" href="mailto:myung11@seas.upenn.edu">email me</a>
          </h2>
      </div>
    </>
  )
}
