import { useEffect, useState } from "react";
import classAPI from "../api/classApi";
import "../assets/styles/ClassStatistics.css";

const ClassStatistics = () => {
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format class names to text
  const formatClassName = (className) => {
    if (!className) return "Unknown";
    
    // Convert to string and trim
    const classStr = String(className).trim();
    
    // Handle numeric class names
    const classNumber = parseInt(classStr);
    if (!isNaN(classNumber)) {
      const numberToText = {
        1: "One",
        2: "Two", 
        3: "Three",
        4: "Four",
        5: "Five",
        6: "Six",
        7: "Seven",
        8: "Eight",
        9: "Nine",
        10: "Ten",
        11: "Eleven",
        12: "Twelve"
      };
      return numberToText[classNumber] || `Class ${classNumber}`;
    }
    
    // Handle text class names (capitalize first letter)
    return classStr.charAt(0).toUpperCase() + classStr.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get all classes
        const classesResponse = await classAPI.getAllClasses();
        console.log("Classes response:", classesResponse);
        
        // Handle different response structures
        const classes = classesResponse.data || classesResponse || [];
        
        if (!Array.isArray(classes) || classes.length === 0) {
          setClassData([]);
          return;
        }

        // Group classes by className (ignore sections)
        const uniqueClassNames = [...new Set(
          classes.map(classItem => 
            classItem.className || classItem.ClassName || classItem.name || classItem
          )
        )];

        console.log("Unique class names:", uniqueClassNames);

        // Get student count for each unique class name
        const classDataWithCounts = await Promise.all(
          uniqueClassNames.map(async (className) => {
            try {
              console.log("Fetching count for class:", className);
              
              const studentCountResponse = await classAPI.getTotalStudentsInClassByName(className);
              console.log("Student count response for", className, ":", studentCountResponse);
              
              // Handle different response structures
              const count = studentCountResponse?.totalStudents || 
                           studentCountResponse?.data?.totalStudents || 
                           studentCountResponse?.count || 
                           studentCountResponse || 
                           0;

              return {
                className: formatClassName(className),
                rawClassName: className,
                count: Number(count) || 0,
              };
            } catch (error) {
              console.error(`Error fetching count for ${className}:`, error);
              return {
                className: formatClassName(className),
                rawClassName: className,
                count: 0,
              };
            }
          })
        );

        // Sort by class number for better display order
        const sortedClassData = classDataWithCounts.sort((a, b) => {
          const aNum = parseInt(a.rawClassName);
          const bNum = parseInt(b.rawClassName);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          return a.className.localeCompare(b.className);
        });

        console.log("Final sorted class data:", sortedClassData);
        setClassData(sortedClassData);
        
      } catch (error) {
        console.error("Error fetching class data:", error);
        setError("Failed to load class statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, []);

  if (loading) {
    return (
      <div className="class-statistics-container">
        <h2>Student Statistics</h2>
        <p className="loading">Loading class wise students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-statistics-container">
        <h2>Student Statistics</h2>
        <p className="error">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="class-statistics-container">
      <h2>Student Statistics</h2>
      <p className="subtitle">Class wise Students</p>
      <div className="class-statistics">
        {classData.length > 0 ? (
          classData.map((data, index) => (
            <div key={index} className="class-statistics-item">
              <div className="circle">
                <span className="count">{data.count}</span>
                <span className="class-name">{data.className}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No classes found</p>
        )}
      </div>
    </div>
  );
};

export default ClassStatistics;