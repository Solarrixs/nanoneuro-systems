import React from 'react';
import { User } from "@nextui-org/user";
import { Link } from "@nextui-org/link";
import Image from 'next/image';

export default function Home() {
  const users = [
    { name: "Maxx", role: "Cofounder", linkedin: "https://www.linkedin.com/in/maxxyung/", avatar: "/maxx.webp" },
    { name: "Joe", role: "Cofounder", linkedin: "https://www.linkedin.com/in/joekojima/", avatar: "/joe.webp" },
    { name: "Izzy", role: "Cofounder", linkedin: "https://www.linkedin.com/in/ihuangg/", avatar: "/izzy.webp" },
    { name: "Sean", role: "Cofounder", linkedin: "https://www.linkedin.com/in/sefang/", avatar: "/sean.webp" },
    { name: "Richard", role: "ML", linkedin: "https://www.linkedin.com/in/richard-wang-73b20b284/", avatar: "/rich.webp" },
    { name: "Matthew", role: "Chem", linkedin: "https://www.linkedin.com/in/matthew-lin-35b1421aa/", avatar: "/matthew.webp" },
  ];

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-black">
      <div className="text-center max-w-lg mb-8">
        <Image
          src="/image.webp"
          height={400}
          width={400}
          alt="Nanoneuro Logo"
        />
        <h2 className="text-stone-200 font-bold text-2xl">
          building biological semiconductors
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        {users.map((user, index) => (
          <div key={index} className="flex flex-col items-center bg-gray-900 p-4 rounded-lg">
            <User
              name={
                <Link href={user.linkedin} size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  {user.name}
                </Link>
              }
              description={user.role}
              avatarProps={{
                src: user.avatar,
                size: "lg",
              }}
              className="flex flex-col items-center text-center"
            />
          </div>
        ))}
      </div>
      
      <h2 className="text-stone-200 font-bold text-xl text-center">
        if you&apos;re looking to fund, <a className="hover:text-purple-500 underline transition duration-200" href="mailto:maxx@nanoneuro.systems">email us</a>
      </h2>
    </div>
  );
}