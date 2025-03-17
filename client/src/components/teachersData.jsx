import { useState } from "react";
import TeacherImage from "../assets/teacher.jpg";

const teachersData = [
  { id: 1, name: "John Doe", contact: "123-456-7890", img: TeacherImage },
  { id: 2, name: "Jane Smith", contact: "987-654-3210", img: TeacherImage},
  { id: 3, name: "Alice Johnson", contact: "555-666-7777", img: TeacherImage},
  { id: 4, name: "Robert Brown", contact: "111-222-3333", img: TeacherImage},
  { id: 5, name: "Emily White", contact: "444-555-6666", img: TeacherImage},
  { id: 6, name: "Michael Green", contact: "777-888-9999", img: TeacherImage},
  { id: 7, name: "Sarah Black", contact: "222-333-4444", img: TeacherImage},
  { id: 8, name: "David Grey", contact: "666-777-8888", img: TeacherImage},
  { id: 9, name: "Laura Brown", contact: "999-000-1111", img: TeacherImage},
  { id: 10, name: "James White", contact: "333-444-5555", img: TeacherImage},
  { id: 11, name: "Emma Green", contact: "888-999-0000", img: TeacherImage},
  { id: 12, name: "Daniel Black", contact: "444-555-6666", img: TeacherImage},
 
];

export default function Teachers() {
  const [showAll, setShowAll] = useState(false);
  const displayedTeachers = showAll ? teachersData : teachersData.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto text-center py-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        Meet Our <span className="text-indigo-600">Amazing Teachers</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
        {displayedTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-gray-100 shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
            <img src={teacher.img} alt={teacher.name} className="w-35    h-35 mx-auto mt-2 rounded-full border-4 border-indigo-600" />
            <h3 className="mt-4 font-semibold text-xl text-gray-800">{teacher.name}</h3>
            <p className="text-gray-500 text-sm">{teacher.contact}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={() => setShowAll(!showAll)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-lg transition-all hover:bg-indigo-700 transform hover:scale-105"
        >
          {showAll ? "See Less" : "See All Teachers"}
        </button>
      </div>
    </div>
  );
}
