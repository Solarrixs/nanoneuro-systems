import React from 'react';
import { User } from "@nextui-org/user";
import { Link } from "@nextui-org/link";
import Image from 'next/image';

export default function Home() {
  const users = [
    { name: "Maxx", role: "Silicon/Bio", linkedin: "https://www.linkedin.com/in/maxxyung/", avatar: "/maxx.webp" },
    { name: "Joe", role: "Bio", linkedin: "https://www.linkedin.com/in/joekojima/", avatar: "/joe.webp" },
    { name: "Izzy", role: "Silicon", linkedin: "https://www.linkedin.com/in/ihuangg/", avatar: "/izzy.webp" },
    { name: "Sean", role: "Software", linkedin: "https://www.linkedin.com/in/sefang/", avatar: "/sean.webp" },
    { name: "Allen", role: "Software", linkedin: "https://www.linkedin.com/in/allenyjl/", avatar: "/allen.webp" },,
    { name: "Richard", role: "Chem", linkedin: "https://www.linkedin.com/in/richard-zhuang-52655b284/", avatar: "/richard.webp" },
    { name: "Ethan", role: "Chem", linkedin: "https://www.linkedin.com/in/ethanbober/", avatar: "/ethan.webp" },
    { name: "Matthew", role: "Chem", linkedin: "https://www.linkedin.com/in/matthew-lin-35b1421aa/", avatar: "/matthew.webp" },
    { name: "Richard", role: "Moral Support", linkedin: "https://www.linkedin.com/in/richard-wang-73b20b284/", avatar: "/rich.webp" },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-black px-4">
      <div className="text-center max-w-lg mb-8">
        <div className="flex justify-center">
          <Image
            src="/image.webp"
            height={300}
            width={300}
            alt="Nanoneuro Logo"
          />
        </div>
        <h2 className="text-stone-200 font-bold text-2xl">
          biological computing
        </h2>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-fuchsia-400 text-lg">
            faster, efficient, native analog hardware for ml
          </p>
          <p className="text-pink-400 text-lg">
            silicon designed and manufactured in-house
          </p>
          <p className="text-purple-400 text-lg">
            using biological neurons for pim architecture
          </p>
          <p className="text-stone-400 text-lg">
            research project led by upenn students
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {users.map((user, index) => (
          <div key={index} className="flex flex-col items-center bg-gray-900 p-6 rounded-lg">
            <User
              name={
                <Link href={user.linkedin} size="md" color="foreground" underline="hover" isExternal showAnchorIcon>
                  {user.name}
                </Link>
              }
              description={user.role}
              avatarProps={{
                src: user.avatar,
                size: "xl",
                className: "w-20 h-20",
                classNames: {
                  base: "w-20 h-20",
                }
              }}
              className="flex flex-col items-center text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}