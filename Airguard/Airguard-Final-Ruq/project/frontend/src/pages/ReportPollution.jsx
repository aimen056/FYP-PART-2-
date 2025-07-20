import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchReports,
  addReport,
  deleteReport,
  editReport,
} from "../redux/features/repPollutionSlice";
import { BsFillTrash3Fill, BsPencilFill, BsX } from "react-icons/bs";
import HomeMap from "../components/HomeMap";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LocationPickerMap from "../components/LocationPickerMap";

const ReportPollution = ({ isOpen, onClose, initialReportData, onReportSubmit, onReportUpdate }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { pollutions, status } = useSelector((state) => state.pollution);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationName, setLocationName] = useState(""); // Store the human-readable location name
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Handle initial report data for editing when used as modal
  useEffect(() => {
    if (initialReportData && isOpen) {
      handleEdit(initialReportData);
    }
  }, [initialReportData, isOpen]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: "",
      location: "",
      pollutionType: "",
      customType: "",
      lat: "",
      lon: "",
    },
    mode: "onChange",
  });

  const pollutionType = watch("pollutionType");
  const locationValue = watch("location");

  const pollutionOptions = [
    "air",
    "water",
    "soil",
    "industrial_emissions",
    "vehicle_emissions",
    "construction_dust",
    "burning_waste",
    "indoor_air_quality",
    "other"
  ];

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setValue("lat", lat.toString(), { shouldValidate: true });
    setValue("lon", lng.toString(), { shouldValidate: true });
    setValue("location", `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`, {
      shouldValidate: true,
    });
    
    // Get location name from coordinates
    getLocationName(lat, lng);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const onSubmit = async (data) => {
    // Enforce login before allowing report submission
    if (!user?.name) {
      toast.error("You must be logged in to submit a report.");
      return;
    }
    // Validate location based on input method
    if (!selectedLocation) {
      toast.error(t("report_pollution.location_required"));
      return;
    }
    
    const formData = new FormData();
    
    // Log the data being prepared
    console.log("Data being prepared for form:", {
      description: data.description,
      location: data.location,
      locationName: locationName || data.location,
      pollutionType: data.pollutionType === "other" ? data.customType : data.pollutionType,
      lat: selectedLocation?.lat?.toString() || "",
      lon: selectedLocation?.lng?.toString() || "",
      imagesCount: images.length
    });
    
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("locationName", locationName || data.location); // Add human-readable location name
    formData.append(
      "pollutionType",
      data.pollutionType === "other" ? data.customType : data.pollutionType
    );
    formData.append("user", user?.name || "Anonymous");
    formData.append("date", new Date().toLocaleString());
    
    // Handle location coordinates based on input method
    formData.append("lat", selectedLocation?.lat?.toString() || "");
    formData.append("lon", selectedLocation?.lng?.toString() || "");
    
    // Only append new images if they exist
    if (images.length > 0) {
    images.forEach((image) => formData.append("images", image));
    }

    try {
      if (editingReport) {
        console.log("Editing report:", editingReport._id);
        console.log("Form data being sent:", {
          description: data.description,
          location: data.location,
          locationName: locationName || data.location,
          pollutionType: data.pollutionType === "other" ? data.customType : data.pollutionType,
          lat: selectedLocation?.lat,
          lon: selectedLocation?.lng,
          imagesCount: images.length
        });
        
        // For editing, use FormData if images are selected, otherwise use JSON
        let response;
        
        // Check if user wants to clear images (no new images selected and editing existing report with images)
        const shouldClearImages = editingReport.images && editingReport.images.length > 0 && images.length === 0;
        
        if (images.length > 0) {
          // If new images are selected, use FormData
          const editFormData = new FormData();
          editFormData.append("description", data.description);
          editFormData.append("location", data.location);
          editFormData.append("locationName", locationName || data.location);
          editFormData.append(
            "pollutionType",
            data.pollutionType === "other" ? data.customType : data.pollutionType
          );
          editFormData.append("lat", selectedLocation?.lat?.toString() || "");
          editFormData.append("lon", selectedLocation?.lng?.toString() || "");
          
          images.forEach((image) => editFormData.append("images", image));
          
          response = await axios.put(
          `https://airguard-backend.onrender.com/api/reports/${editingReport._id}`,
            editFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        } else {
          // If no new images, use JSON
          const updateData = {
            description: data.description,
            location: data.location,
            locationName: locationName || data.location,
            pollutionType: data.pollutionType === "other" ? data.customType : data.pollutionType,
            lat: selectedLocation?.lat?.toString() || "",
            lon: selectedLocation?.lng?.toString() || "",
          };
          
          // If user wants to clear images, add a flag
          if (shouldClearImages) {
            updateData.clearImages = true;
          }
          
          response = await axios.put(
            `https://airguard-backend.onrender.com/api/reports/${editingReport._id}`,
            updateData,
            { headers: { "Content-Type": "application/json" } }
          );
        }
        console.log("Update response:", response.data);
        dispatch(editReport({ id: editingReport._id, ...response.data }));
        toast.success(t("report_pollution.update_success"));
        // Refresh the reports list and reset the form after editing
        await dispatch(fetchReports());
        setEditingReport(null);
        setSelectedLocation(null);
        setImages([]);
        setImagePreviews([]);
        setLocationName("");
        reset();
        
        // Call callback if used as modal
        if (onReportUpdate) {
          onReportUpdate();
        }
      } else {
        const response = await axios.post(
          "https://airguard-backend.onrender.com/api/reports",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        dispatch(addReport(response.data));
        toast.success(t("report_pollution.submit_success"));
        
        // Call callback if used as modal
        if (onReportSubmit) {
          onReportSubmit();
        }
      }

      setEditingReport(null);
      setSelectedLocation(null);
      setImages([]);
      setImagePreviews([]);
      reset();
    } catch (error) {
      toast.error(t("error.failed_submit_report"));
      console.error("Error submitting report:", error);
    }
  };

  const handleEdit = (report) => {
    if (report.user !== user?.name) {
      toast.error(t("error.edit_own_reports"));
      return;
    }
    setEditingReport(report);
    
    // Determine location input method based on whether coordinates exist
    const hasCoordinates = report.lat && report.lon;
    
    setSelectedLocation(
      hasCoordinates ? { lat: report.lat, lng: report.lon } : null
    );
    setImagePreviews(report.images || []);
    setImages([]);
    
    // Set location name (use locationName if available, otherwise use location)
    const displayLocation = report.locationName || report.location;
    setLocationName(displayLocation);
    
    reset({
      description: report.description,
      location: displayLocation,
      pollutionType: pollutionOptions.includes(report.pollutionType)
        ? report.pollutionType
        : "other",
      customType: !pollutionOptions.includes(report.pollutionType)
        ? report.pollutionType
        : "",
      lat: report.lat?.toString() || "",
      lon: report.lon?.toString() || "",
    });
  };

  const handleDelete = (id) => {
    const report = pollutions.find((r) => r._id === id);
    if (report.user !== user?.name) {
      toast.error(t("error.delete_own_reports"));
      return;
    }
    if (window.confirm(t("report_pollution.confirm_delete"))) {
      dispatch(deleteReport(id));
      toast.success("Report deleted successfully");
    }
  };

  // Check for deleted reports (this would be implemented with a notification system)
  useEffect(() => {
    // In a real app, you would check for notifications about deleted reports
    // For now, we'll just show a placeholder
    const checkDeletedReports = () => {
      // This would be implemented with a real notification system
      console.log("Checking for deleted report notifications...");
    };
    checkDeletedReports();
  }, []);

  const markers = selectedLocation
    ? [
        {
          geocode: [selectedLocation.lat, selectedLocation.lng],
          label: t("report_pollution.select_location_map"),
          status: "good",
        },
      ]
    : [];

  const getLocationName = async (lat, lng) => {
    setIsLoadingLocation(true);
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free and no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        // Use the complete location name for better readability
        const fullLocationName = data.display_name;
        
        setLocationName(fullLocationName);
        setValue("location", fullLocationName, { shouldValidate: true });
      } else {
        // Fallback to coordinates if no address found
        setLocationName(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
        setValue("location", `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error getting location name:", error);
      // Fallback to coordinates
      setLocationName(`Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
      setValue("location", `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`, { shouldValidate: true });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className={`pt-16 bg-background dark:bg-background dark:text-[#E4E4E7] min-h-screen ${isOpen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingReport ? t("report_pollution.edit_title") : t("report_pollution.title")}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <BsX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-surfaceColor p-2 m-2">
                <h1 className="text-base md:text-lg font-semibold text-center uppercase">
                  {t("report_pollution.title")}
                </h1>
              </div>

              <div className="bg-surfaceColor p-4 m-2">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white dark:bg-background p-6 rounded-lg shadow-md space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t("report_pollution.description_label")}:</label>
                    <textarea
                      placeholder={t("report_pollution.description_placeholder")}
                      {...register("description", { required: t("report_pollution.description_required") })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">{t("report_pollution.location_label")}:</label>
                    
                    {/* Map Selection */}
                    <div className="mb-4">
                    <div className="h-64 border rounded-lg overflow-hidden">
                        <LocationPickerMap selectedLocation={selectedLocation} onMapClick={handleMapClick} />
                    </div>
                      {!selectedLocation && (
                        <p className="text-red-500 text-sm mt-1">{t("report_pollution.location_required")}</p>
                    )}
                    {selectedLocation && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                        {t("report_pollution.selected_location", {
                          lat: selectedLocation.lat.toFixed(4),
                          lon: selectedLocation.lng.toFixed(4),
                        })}
                      </p>
                          {isLoadingLocation && (
                            <p className="text-sm text-blue-600 mt-1">
                              {t("report_pollution.loading_location_name")}...
                            </p>
                          )}
                          {locationName && !isLoadingLocation && (
                            <p className="text-sm text-green-600 mt-1 font-medium">
                              {t("report_pollution.location_name")}: {locationName}
                            </p>
                          )}
                        </div>
                    )}
                  </div>

                    {/* Location Display (always shown) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">{t("report_pollution.final_location")}:</label>
                    <input
                      type="text"
                        value={watch("location") || ""}
                      readOnly
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 bg-gray-100 dark:bg-gray-600"
                        placeholder={t("report_pollution.click_map_to_select")}
                    />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">{t("report_pollution.pollution_type_label")}:</label>
                    <select
                      {...register("pollutionType", { required: t("report_pollution.pollution_type_required") })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    >
                      <option value="">{t("report_pollution.select_pollution_type")}</option>
                      {pollutionOptions.map((type) => (
                        <option key={type} value={type}>
                          {t(`pollution_type.${type}`)}
                        </option>
                      ))}
                    </select>
                    {errors.pollutionType && (
                      <p className="text-red-500 text-sm">{errors.pollutionType.message}</p>
                    )}
                  </div>

                  {pollutionType === "other" && (
                    <div>
                      <label className="block text-sm font-semibold mb-1">{t("report_pollution.custom_type_label")}:</label>
                      <input
                        type="text"
                        {...register("customType", { required: t("report_pollution.custom_type_required") })}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700"
                      />
                      {errors.customType && (
                        <p className="text-red-500 text-sm">{errors.customType.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-1">{t("report_pollution.upload_images")}:</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-2 flex-wrap mb-2">
                        {imagePreviews.map((preview, index) => (
                          <img
                            key={index}
                            src={preview}
                            alt={`${t("reports.images")} ${index + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                        ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImages([]);
                            setImagePreviews([]);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Clear Images
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingReport ? t("report_pollution.update_report") : t("report_pollution.submit_report")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className="bg-surfaceColor p-2 m-2">
        <h1 className="text-base md:text-lg font-semibold text-center uppercase">
          {t("report_pollution.title")}
        </h1>
      </div>

      <div className="bg-surfaceColor p-4 m-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-background p-6 rounded-lg shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-1">{t("report_pollution.description_label")}:</label>
            <textarea
              placeholder={t("report_pollution.description_placeholder")}
              {...register("description", { required: t("report_pollution.description_required") })}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">{t("report_pollution.location_label")}:</label>
            
            {/* Map Selection */}
            <div className="mb-4">
            <div className="h-64 border rounded-lg overflow-hidden">
                <LocationPickerMap selectedLocation={selectedLocation} onMapClick={handleMapClick} />
            </div>
              {!selectedLocation && (
                <p className="text-red-500 text-sm mt-1">{t("report_pollution.location_required")}</p>
            )}
            {selectedLocation && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                {t("report_pollution.selected_location", {
                  lat: selectedLocation.lat.toFixed(4),
                  lon: selectedLocation.lng.toFixed(4),
                })}
              </p>
                  {isLoadingLocation && (
                    <p className="text-sm text-blue-600 mt-1">
                      {t("report_pollution.loading_location_name")}...
                    </p>
                  )}
                  {locationName && !isLoadingLocation && (
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      {t("report_pollution.location_name")}: {locationName}
                    </p>
                  )}
                </div>
            )}
          </div>

            {/* Location Display (always shown) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t("report_pollution.final_location")}:</label>
            <input
              type="text"
                value={watch("location") || ""}
              readOnly
                className="w-full p-2 border rounded-lg dark:bg-gray-700 bg-gray-100 dark:bg-gray-600"
                placeholder={t("report_pollution.click_map_to_select")}
            />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">{t("report_pollution.pollution_type_label")}:</label>
            <select
              {...register("pollutionType", { required: t("report_pollution.pollution_type_required") })}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="">{t("report_pollution.select_pollution_type")}</option>
                  {pollutionOptions.map((type) => (
                    <option key={type} value={type}>
                      {t(`pollution_type.${type}`)}
                </option>
              ))}
            </select>
            {errors.pollutionType && (
              <p className="text-red-500 text-sm">{errors.pollutionType.message}</p>
            )}
          </div>

          {pollutionType === "other" && (
            <div>
              <label className="block text-sm font-semibold mb-1">{t("report_pollution.custom_type_label")}:</label>
              <input
                type="text"
                {...register("customType", { required: t("report_pollution.custom_type_required") })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700"
              />
              {errors.customType && (
                <p className="text-red-500 text-sm">{errors.customType.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">{t("report_pollution.upload_images")}:</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-2 flex-wrap mb-2">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`${t("reports.images")} ${index + 1}`}
                    className="h-16 w-16 object-cover rounded border"
                  />
                ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImages([]);
                    setImagePreviews([]);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear Images
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {editingReport ? t("report_pollution.update_report") : t("report_pollution.submit_report")}
          </button>
        </form>
      </div>

      <div className="p-2">
        <div className="bg-surfaceColor p-2">
          <h3 className="text-base md:text-lg font-semibold text-center uppercase">
            {t("report_pollution.your_reports")}
          </h3>
        </div>
        {status === "loading" ? (
          <p className="text-gray-500">{t("reports.loading")}</p>
        ) : pollutions.filter((r) => r.user === user?.name).length === 0 ? (
          <p className="text-gray-500">{t("report_pollution.no_reports")}</p>
        ) : (
          <div className="relative overflow-x-auto border border-primaryText/20 rounded-t-3xl mt-4 mx-3">
            <table className="w-full text-sm">
              <thead className="text-xs text-primaryText uppercase bg-primaryBtnText/20 dark:bg-primaryBtnText/50">
                <tr>
                  <th className="px-6 py-3 text-center">{t("reports.pollution_type")}</th>
                  <th className="px-6 py-3 text-center">{t("description")}</th>
                  <th className="px-6 py-3 text-center">{t("location")}</th>
                  <th className="px-6 py-3 text-center">{t("reports.date")}</th>
                  <th className="px-6 py-3 text-center">{t("status")}</th>
                  <th className="px-6 py-3 text-center">{t("reports.images")}</th>
                  <th className="px-6 py-3 text-center">{t("manage_alert.action")}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-surfaceColor divide-y divide-gray-200">
                {pollutions
                  .filter((r) => r.user === user?.name)
                      .sort((a, b) => {
                        // Put rejected reports first
                        if (a.verificationStatus === "rejected" && b.verificationStatus !== "rejected") {
                          return -1;
                        }
                        if (a.verificationStatus !== "rejected" && b.verificationStatus === "rejected") {
                          return 1;
                        }
                        // Then sort by date (newest first)
                        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
                      })
                  .map((report) => (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-4 text-center">
                        {pollutionOptions.includes(report.pollutionType) 
                          ? t(`pollution_type.${report.pollutionType}`)
                          : report.pollutionType}
                      </td>
                      <td className="px-4 py-4 text-center">{report.description}</td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <div className="font-medium">{report.locationName || report.location}</div>
                          {report.lat && report.lon && (
                            <div className="text-xs text-gray-500">
                              Lat: {report.lat.toFixed(4)}, Lon: {report.lon.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">{report.date}</td>
                     <td className="px-4 py-4 text-center">
  <span
    className={`px-2 py-1 rounded-full text-xs ${
      report.verificationStatus === "verified"
        ? "bg-green-100 text-green-800"
        : report.verificationStatus === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {t(`status.${report.verificationStatus}`)}
  </span>
                        {report.verificationStatus === "rejected" && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                            <p className="text-red-800 dark:text-red-200 font-semibold mb-1">Admin's Reason:</p>
                            <p className="text-red-700 dark:text-red-300">
                              {report.rejectionComment || "No specific reason provided by admin."}
                            </p>
                          </div>
                        )}
</td>
                      <td className="px-4 py-4 text-center">
                        {report.images?.length > 0 ? (
                          <div className="flex gap-2 justify-center">
                            {report.images.map((image, index) => (
                              <a
                                key={index}
                                href={image}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={image}
                                  alt={`${t("reports.images")} ${index + 1}`}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              </a>
                            ))}
                          </div>
                        ) : (
                          t("reports.none")
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {report.verificationStatus === "rejected" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(report)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit & Resubmit"
                            >
                              <BsPencilFill className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(report._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <BsFillTrash3Fill className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(report)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                        >
                          <BsPencilFill className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-red-600 hover:text-red-800"
                              title="Delete"
                        >
                          <BsFillTrash3Fill className="w-4 h-4" />
                        </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default ReportPollution;