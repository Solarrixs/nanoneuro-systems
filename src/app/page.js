import {User} from "@nextui-org/user";
import {Link} from "@nextui-org/link";
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-black">
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
        <div className="mb-4 items-center justify-center text-stone-200">
          <div>
          <User
            className="ml-4 mr-8"
            name=
            <Link href="https://www.linkedin.com/in/maxxyung/" size="sm" color="foreground" underline="hover" isExternal showAnchorIcon>
              Maxx Yung
            </Link>
            description="Materials Lead"
            avatarProps={{
              src: "/maxx.webp"
            }}
          />
          <User
            className="mr-8"
            name=
            <Link href="https://www.linkedin.com/in/joekojima/" size="sm" color="foreground" underline="hover" isExternal showAnchorIcon>
              Joe Kojima
            </Link>
            description="Biologics Lead"
            avatarProps={{
              src: "/joe.webp"
            }}
          />
          </div>
          <div className="mb-4">
          <User
            className="ml-4 mr-8"
            name=
            <Link href="https://www.linkedin.com/in/ihuangg/" size="sm" color="foreground" underline="hover" isExternal showAnchorIcon>
              Izzy Huang
            </Link>
            description="Electrical Lead"
            avatarProps={{
              src: "/izzy.webp"
            }}
          />
          <User
            className="mr-8"
            name=
            <Link href="https://www.linkedin.com/in/sefang/" size="sm" color="foreground" underline="hover" isExternal showAnchorIcon>
              Sean Fang
            </Link>
            description="Comp Sci Lead"
            avatarProps={{
              src: "/sean.webp"
            }}
          />
          </div>
        </div>
        <h2 className="text-stone-200 font-bold text-1xl mb-4 text-center">
          if you&apos;re looking to fund, <a className="hover:text-nanoPurple underline transition duration-200" href="mailto:myung11@seas.upenn.edu">email us</a>
          </h2>
      </div>
    </>
  )
}
