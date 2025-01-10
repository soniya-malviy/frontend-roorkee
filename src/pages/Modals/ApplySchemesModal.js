import { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/router";
import HowToApply from './HowToApply';  
import { useAuth } from "@/Context/AuthContext";
import { useBookmarkContext } from "@/Context/BookmarkContext";
import { useScheme } from "@/Context/schemeContext";
import SavedModal from "@/pages/Modals/savedModal"
import Toast from "@/components/ComponentsUtils/SavedToast";
import UnSaveToast from "@/components/ComponentsUtils/UnsaveToast";


const ApplyModal = ({
  isOpen,
  onRequestClose,
  scheme,
  setSidePannelSelected,
}) => {
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    scheme_id: "",
    description: "",
    report_category: "",
  });
  const { isBookmarked, toggleBookmark } = useBookmarkContext();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter()
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const descriptionRef = useRef(null);
  const [isHowToApplyOpen, setIsHowToApplyOpen] = useState(false); 

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isUnSaveToastVisible, setIsUnSaveToastVisible] = useState(false);
  const {authState} = useAuth()
  const { saveScheme } = useScheme();
  const { unsaveScheme } = useScheme();

  const handleSave = async (scheme_id, authState) => {
    const success = isBookmarked[scheme_id]
          ? await unsaveScheme(scheme_id, authState)
          : await saveScheme(scheme_id, authState);
    if (success && !isBookmarked[scheme_id]) {
      toggleBookmark(scheme_id, isBookmarked[scheme_id])
      console.log("Scheme saved successfully!");
      setIsToastVisible(true)
      setIsSaved(true)
    }else if (success && isBookmarked[scheme_id]){
      toggleBookmark(scheme_id, isBookmarked[scheme_id])
      setIsUnSaveToastVisible(true)
      setIsSaved(false)
    } else {
      setIsSavedModalOpen(true)
      console.error("Failed to save scheme");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (scheme && scheme.id) {
        try {
          const [criteriaRes, documentsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schemes/${scheme.id}/criteria/`),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schemes/${scheme.id}/documents/`),
          ]);

          if (!criteriaRes.ok) {
            throw new Error(`Error fetching criteria: ${criteriaRes.statusText}`);
          }
          if (!documentsRes.ok) {
            throw new Error(`Error fetching documents: ${documentsRes.statusText}`);
          }

          const [criteriaData, documentsData] = await Promise.all([
            criteriaRes.json(),
            
            documentsRes.json(),
          ]);

          setCriteria(criteriaData);
          setDocuments(documentsData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load data. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Invalid scheme data");
      }
    };
    
    fetchData();
    
  }, [scheme]);



  useEffect(() => {
    if (isBookmarked[scheme?.id]) {
      console.log("This scheme is already bookmarked.");
      setIsSaved(true);
    } else {
      console.log("This scheme is not bookmarked.");
      setIsSaved(false);
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);


  useEffect(() => {
    if (descriptionRef.current) {
      const isLong = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionLong(isLong);
    }
  }, [scheme?.description]);

  const handleReportFormChange = (e) => {

    const { name, value } = e.target;
    setReportFormData((prevData) => ({
      ...prevData,
      scheme_id: scheme.id,
      [name]: value,
    }));
  };

  

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/scheme-reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authState.token}`
        },
        body: JSON.stringify(reportFormData),
      });

      if (!response.ok) {
        throw new Error(`Error creating report: ${response.statusText}`);
      }

      alert("Report created successfully!");
      setReportFormData({  description: "", report_category: "" });
      setReportModalOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to create report. Please try again later.");
    }
  };


  const handleHowToApply = () => {
    setIsHowToApplyOpen(true); 
  };

  const handleCloseHowToApply = () => {
    setIsHowToApplyOpen(false); 
  };


  
  

  if (!isOpen) return null;

  

  return (

    <div className="fixed inset-0 z-50 gap-[10px] pointer-events-none">
     <div

  className={`absolute h-screen sm:h-screen bg-white transition-all w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[40%] right-0 top-0 p-4 sm:p-6 rounded-lg border gap-[10px] border-gray-200 shadow-lg z-50 pointer-events-auto`}
  style={{
    right: "0",
  }}
>
        <button
          className="absolute right-4 p-[20px] text-lg hover:text-red-500"
          onClick={onRequestClose}
        >
          <IoMdClose className="w-[24px] h-[24px]" />
        </button>

        <div className="modal-content overflow-y-auto max-h-[90vh] p-8 h-full">
        {/* <div className="flex justify-between items-center w-full mb-4">
  <h1 className="text-[20px] font-bold">{scheme.title}</h1>
  
  {scheme?.created_at?.split(" ")[0] && (
    <p className="text-sm rounded-[12px] py-1 px-4 bg-[#EEF] inline-block">
      {`Last updated on ${scheme.created_at.split(" ")[0]}`}
    </p>
  )}
</div> */}


<div className="flex flex-col  items-start w-full py-[20px] overflow-hidden">
  {/* Title and Report Button */}
  <div className="flex items-center justify-between w-full flex-wrap ">
    <h1 className="text-[20px] font-bold mb-2 w-full sm:w-auto ">{scheme.title}</h1>
  </div>

  {/* Date and Report Button aligned */}

  <div className="flex items-center justify-between w-full mt-2">

{/* Date */}
{scheme?.created_at?.split(" ")[0] && (
  <p className="text-[11px] sm:text-[14px] rounded-[12px] py-1 px-[6px] bg-[#EEF] mr-4 whitespace-nowrap">
    {`Last updated on ${scheme.created_at.split(" ")[0]}`}
  </p>
)}

{/* Report Button */}
<button
  onClick={() => authState.token ? setReportModalOpen(true) : setIsReportModalOpen(true)}
  className="flex items-center px-4 py-2 text-red-500 rounded-lg mt-0"
>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.29333 5.06878C1.45958 3.01956 3.23942 1.66667 5.16536 1.66667H14.835C16.7609 1.66667 18.5408 3.01956 18.707 5.06878C18.8298 6.5824 18.835 8.56439 18.2938 10.2542C17.8082 11.7704 16.7768 13.2271 15.6693 14.4731C14.5524 15.7296 13.3061 16.8288 12.3211 17.6271C10.9584 18.7315 9.04192 18.7315 7.6792 17.6271C6.69419 16.8288 5.44795 15.7296 4.33102 14.4731C3.22349 13.2271 2.19215 11.7704 1.70654 10.2542C1.16532 8.56439 1.17054 6.5824 1.29333 5.06878ZM5.16536 3.33334C3.97458 3.33334 3.04031 4.14627 2.95454 5.20355C2.83725 6.64935 2.85308 8.36985 3.29379 9.74582C3.67591 10.9389 4.53168 12.1902 5.5767 13.3658C6.61231 14.5309 7.78406 15.5668 8.72856 16.3323C9.47954 16.9409 10.5208 16.9409 11.2718 16.3323C12.2163 15.5668 13.388 14.5309 14.4236 13.3658C15.4687 12.1902 16.3244 10.9389 16.7065 9.74582C17.1472 8.36985 17.1631 6.64935 17.0458 5.20355C16.96 4.14627 16.0257 3.33334 14.835 3.33334H5.16536ZM10.0002 5.83334C10.4604 5.83334 10.8335 6.20643 10.8335 6.66667V10C10.8335 10.4602 10.4604 10.8333 10.0002 10.8333C9.53993 10.8333 9.16683 10.4602 9.16683 10V6.66667C9.16683 6.20643 9.53993 5.83334 10.0002 5.83334Z" fill="#FF0000"/>
    <path d="M10.8337 13.3333C10.8337 13.7936 10.4606 14.1667 10.0003 14.1667C9.54009 14.1667 9.16699 13.7936 9.16699 13.3333C9.16699 12.8731 9.54009 12.5 10.0003 12.5C10.4606 12.5 10.8337 12.8731 10.8337 13.3333Z" fill="#FF0000"/>
  </svg>
  Report
</button>
</div>

</div>





          {loading ? (
            <div className="flex items-center justify-center flex-grow">
              <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
             

              {scheme.department?.state && (
                <div className="flex items-start py-[2rem] border-b-[1px] mt-4">
                  <h2 className="w-28 text-[14px]  font-semibold">State:</h2>
                  <p className="flex-1">{scheme.department.state}</p>
                </div>
              )}

        

              {scheme.department?.department_name && (
                <div className="flex items-start py-[2rem] border-t-[1px] border-b-[1px]">
                  <h2 className="w-28 text-[14px] font-semibold">Department:</h2>
                  <p className="flex-1">{scheme.department.department_name}</p>
                </div>
              )}

              {scheme.beneficiaries[0]?.beneficiary_type && (
                <div className="flex items-start py-[2rem]  border-b-[1px]">
                  <h2 className="w-28 text-[14px] font-semibold">Beneficiaries:</h2>
                  <p className="flex-1">{scheme.beneficiaries[0].beneficiary_type}</p>
                </div>
              )}

{scheme.criteria?.state && (
                <div className="flex items-start py-[2rem] border-b-[1px] mt-4">
                  <h2 className="w-28 text-[14px]  font-semibold">Eligibility:
</h2>
                  <p className="flex-1">{scheme.department.criteria}</p>
                </div>
              )}

{scheme.description && (
                <div className="border-b-[1px] py-[2rem]">
                  <h2 className="text-[14px] font-semibold mb-[10px]">Description:</h2>
                  <p
                    ref={descriptionRef}
                    className={`${readMore || !isDescriptionLong ? "" : "line-clamp-3"} overflow-y-auto`}
                  >
                    {scheme.description}
                  </p>
                  {isDescriptionLong && (
                    <button
                      onClick={() => setReadMore(!readMore)}
                      className="mt-2 text-[#3431Bb] text-sm"
                    >
                      {readMore ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>
              )}

             

              {/* Updated "Uploaded File" Section */}
              {scheme.pdf_url && (
                <div className="flex items-start py-[2rem] border-b-[1px]">
                  <h2 className="w-28 text-[14px] font-semibold">Uploaded File:</h2>
                  <div className="flex-1">
                    <a
                      href={scheme.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-4 py-2 rounded-lg border border-transparent bg-[#3431Bb] text-white hover:bg-blue-700 text-[12px] sm:text-sm"
                    >
                      Click here for preview
                    </a>
                      {scheme.pdf_url && scheme.pdf_url.startsWith('https://launchpad-pdf-files') ? (
                        <div className="flex justify-start mt-4">
                          <button
                            onClick={() => window.open(scheme.pdf_url, "_blank")}
                            className="bg-[#3431Bb] text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 text-xs sm:text-sm"
                          >
                            Click here for preview
                          </button>
                        </div>
                      ) : null}
                  </div>
                </div>
              )}
 
              {scheme.scheme_link ? (
                <>
                  <div className="mt-8 flex sm:gap-[50px] gap-[5px] justify-between">

                    <div className="flex items-center text-[#3431Bb] font-semibold cursor-pointer" onClick={() => handleSave(scheme.id,authState)}>
                    {isSaved ? "Unsave Scheme" : "Save for Later"}
                    </div>
                    

                {isToastVisible && (
                          <Toast
                            message={""}
                            onClose={() => setIsToastVisible(false)}
                          />
                        )}

            {isUnSaveToastVisible && (
                      <UnSaveToast
                        message={""}
                        onClose={() => setIsUnSaveToastVisible(false)}
                      />
                    )}

                  
                    <div className="flex-shrink-0">
                      <a
                        href={scheme.scheme_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 rounded-lg border border-transparent bg-[#3431Bb] text-white hover:bg-blue-700 text-[12px] sm:text-sm"
                      >
                        Apply
                      </a>
                    </div>
                  </div>


                  <div className="mt-8">
                    {scheme.pdf_url && scheme.pdf_url.startsWith('https://launchpad-pdf.s3.amazonaws.com') ? (
                      <div className="flex justify-center">
                        <embed
                          src={scheme.pdf_url}
                          width="100%"
                          height="500px"
                          type="application/pdf"
                          className="rounded-lg object-cover max-w-full"
                        />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </>
          )}

           {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 bg-gray-700 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-[80%] sm:w-[60%] lg:w-[40%]">
         
           
          <h2 className="text-xl font-bold flex items-center justify-center mb-4 text-[#3330BA] text-center">
  Help Us Improve
</h2>
            <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  name="report_category"
                  value={reportFormData.category}
                  onChange={handleReportFormChange}
                  required
                  className="w-full p-2 border text-sm rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="incorrect_info">Incorrect information</option>
                  <option value="outdated_info">Outdated information</option>
                  <option value="other">Other</option>
                </select>
              </div>
             
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={reportFormData.description}
                  onChange={handleReportFormChange}
                  required
                  rows="4"
                  className="w-full p-2 border rounded-md"
                />
              </div>

             

              <div className="flex justify-end mt-4 space-x-4">
              <button
                type="submit"
                className="flex-shrink-0 px-4 py-2 rounded-lg border border-transparent bg-[#3431Bb] text-white hover:bg-blue-700 text-[12px] sm:text-sm"
              >
                Submit Report
              </button>

              <button
                type="button"  
                onClick={() => setReportModalOpen(false)}  
                className="flex-shrink-0 px-4 py-2 rounded-lg border border-transparent bg-gray-500 text-white hover:bg-blue-700 text-[12px] sm:text-sm"
              >
                Cancel
              </button>
            </div>

            </form>
          </div>
        </div>
      )}

          <div>
            Not sure how to apply?{" "}
            <span
              className="text-[#3431Bb] cursor-pointer"
              onClick={handleHowToApply} 
            >
              click here
            </span>{" "}
            to know how to apply
          </div>
        </div>
      </div>

      {isHowToApplyOpen && (
        <HowToApply closeModal={handleCloseHowToApply} /> 
      )}
      {isSavedModalOpen && (
          <SavedModal
            isOpen={isSavedModalOpen}
            onRequestClose={() => setIsSavedModalOpen(false)}
            heading={'Saved'}
            tag={'save'}
          />
        )}
        {isReportModalOpen && (
          <SavedModal
            isOpen={isReportModalOpen}
            onRequestClose={() => setIsReportModalOpen(false)}
            heading={'Report'}
            tag={'report'}
          />
        )}
      
    </div>
  );
};

export default ApplyModal;
