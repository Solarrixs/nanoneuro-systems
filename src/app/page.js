import { User } from "@nextui-org/user";
import { Link } from "@nextui-org/link";
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-black">
        <div className="text-center max-w-lg">
          <Image
            src="/image.webp"
            height={400}
            width={400}
            alt="Nanoneuro Logo"
          />
          <h2 className="text-stone-200 font-bold text-2xl mb-8">
            building biological semiconductors
          </h2>
        </div>
        <div className="mb-4 flex flex-col items-center justify-center text-stone-200">
          <div className="flex mb-4">
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/maxxyung/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Maxx Yung
                </Link>
              }
              description="Semis Lead"
              avatarProps={{
                src: "/maxx.webp",
                size: "md",
              }}
            />
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/joekojima/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Joe Kojima
                </Link>
              }
              description="Biologics Lead"
              avatarProps={{
                src: "/joe.webp",
                size: "md",
              }}
            />
          </div>
          <div className="flex mb-4">
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/ihuangg/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Izzy Huang
                </Link>
              }
              description="Electrical Lead"
              avatarProps={{
                src: "/izzy.webp",
                size: "md",
              }}
            />
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/sefang/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Sean Fang
                </Link>
              }
              description="Comp Sci Lead"
              avatarProps={{
                src: "/sean.webp",
                size: "md",
              }}
            />
          </div>
          <div className="w-full border-t border-gray-600 my-4"></div>
          <div className="flex">
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/richard-zhuang-52655b284/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Richard Zhuang
                </Link>
              }
              description="Chemistry Assistant"
              avatarProps={{
                src: "/richard.webp",
                size: "md",
              }}
            />
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/richard-wang-73b20b284/" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Richard Wang
                </Link>
              }
              description="Outreach Director"
              avatarProps={{
                src: "/rich.webp",
                size: "md",
              }}
            />
            <User
              className="mx-4"
              name={
                <Link href="https://www.linkedin.com/in/ethanbober" size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  Ethan Bober
                </Link>
              }
              description="Materials Engineer"
              avatarProps={{
                src: "/ethan.webp",
                size: "md",
              }}
            />
          </div>
        </div>
        <h2 className="text-stone-200 font-bold text-1xl mb-4 mt-8 text-center">
          if you&apos;re looking to fund, <a className="hover:text-nanoPurple underline transition duration-200" href="mailto:maxx@nanoneuro.systems">email us</a>
        </h2>
      </div>
    </>
  )
}