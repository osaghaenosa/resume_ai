import React from 'react';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, avatarUrl }) => (
  <div className="bg-[#0B1120] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
    <p className="text-gray-300 italic">"{quote}"</p>
    <div className="flex items-center mt-6">
      <img
        className="h-12 w-12 rounded-full object-cover border-2 border-cyan-500"
        src={avatarUrl}
        alt={name}
      />
      <div className="ml-4">
        <p className="font-bold text-white">{name}</p>
        <p className="text-sm text-cyan-400">{role}</p>
      </div>
    </div>
  </div>
);

const testimonials = [
  {
    quote:
      "This tool is a game-changer. I got three interviews within a week of using the resume it generated. The writing was so natural.",
    name: "Sarah J.",
    role: "Marketing Manager",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "I always struggled with sounding confident on paper. This service nailed the tone and helped me articulate my experience perfectly.",
    name: "Michael B.",
    role: "Software Engineer",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "The cover letter feature is incredible. It saved me hours of work and the result was far better than anything I could have written myself.",
    name: "Emily K.",
    role: "UX Designer",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function Testimonials() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Trusted by Professionals
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          See what our users are saying about their success.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </>
  );
}