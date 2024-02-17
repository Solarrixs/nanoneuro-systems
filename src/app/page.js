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
        </div>
        <div className="mb-4">
          <div>
          <User
            className="mr-8"
            name="Maxx Yung"
            description="Materials Engineer"
            avatarProps={{
              src: "/maxx.webp"
            }}
          />
          <User
            className="mr-8"
            name="Joe Kojima"
            description="Biological Engineer"
            avatarProps={{
              src: "/joe.webp"
            }}
          />
          </div>
          <div className="mb-4">
          <User
            className="mr-8"
            name="Izzy Huang"
            description="Electrical Engineer"
            avatarProps={{
              src: "/izzy.webp"
            }}
          />
          <User
            className="mr-8"
            name="Sean Fang"
            description="Computer Science"
            avatarProps={{
              src: "/sean.webp"
            }}
          />
          </div>
        </div>
        <h2 className="text-stone-200 font-bold text-1xl mb-4 text-center">
          if you&apos;re still interested in joining or looking to fund, <a className="hover:text-nanoPurple underline transition duration-200" href="mailto:myung11@seas.upenn.edu">email me</a>
          </h2>
      </div>
    </>
  )
}
