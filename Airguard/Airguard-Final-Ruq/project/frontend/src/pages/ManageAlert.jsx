import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  fetchAlerts,
  deleteAlert,
  toggleAlertStatus,
  updateAlert,
} from "../redux/features/alertSlice";
import { BsFillTrash3Fill, BsPencilFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";

const ManageAlert = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alert.alerts || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteAlert(id));
  };

  const handleToggleStatus = (id) => {
    dispatch(toggleAlertStatus(id));
  };

  const handleEdit = (alert) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="pt-16 bg-background dark:bg-background dark:text-[#E4E4E7] h-screen">
        <div>
          <div className="bg-surfaceColor p-2 m-2">
            <h1 className="text-base md:text-lg font-semibold text-center uppercase">
              {t("manage_alert.title")}
            </h1>
          </div>
          <div className="bg-surfaceColor p-2 m-2">
            <div className="flex justify-between items-center p-2 m-1">
              <h2 className="text-lg font-semibold">
                <span className="underline underline-offset-4 decoration-primaryBtnBg decoration-2 rounded-3xl">
                  {t("manage_alert.your_alerts")}
                </span>
              </h2>
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  setModalOpen(true);
                }}
                className="bg-primaryBtnBg text-primaryBtnText font-bold px-4 py-2 rounded-xl text-sm md:text-base"
              >
                {t("manage_alert.new_alert")}
              </button>
            </div>

            <div className="relative overflow-x-auto border border-primaryText/20 rounded-t-3xl m-2">
              <table className="w-full p-10 text-sm rtl:text-right">
                <thead className="text-xs text-gray-900 uppercase dark:text-gray-400 bg-primaryBtnText/20 dark:bg-primaryBtnText/50 rounded-2xl">
                  <tr>
                    <th className="px-6 whitespace-nowrap py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.alert_name")}
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.location")}
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.pollutant")}
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.threshold")}
                    </th>
                    <th className="px-2 py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.status")}
                    </th>
                    <th className="hidden md:table-cell px-6 whitespace-nowrap py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.created_at")}
                    </th>
                    <th className="px-2 py-3 text-center text-xs text-primaryText/90 font-bold uppercase tracking-wider">
                      {t("manage_alert.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surfaceColor divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr
                      key={alert._id}
                      className="hover:bg-primaryBtnText/10 dark:hover:bg-primaryBtnText/40 transition-colors text-primaryText dark:text-primaryText"
                    >
                      <td className="px-4 py-4 tracking-widest font-medium text-justify whitespace-nowrap text-sm">
                        {alert.alertName}
                        <dl className="lg:hidden font-normal tracking-normal">
                          <dt className="sr-only">{t("manage_alert.location")}</dt>
                          <dd className="mt-1 text-primaryText/90">{alert.location}</dd>
                          <dt className="sr-only sm:hidden">{t("manage_alert.pollutant")}</dt>
                          <dd className="sm:hidden text-primaryText/70">{alert.pollutantName}</dd>
                          <dt className="sr-only sm:hidden">{t("manage_alert.threshold")}</dt>
                          <dd className="sm:hidden text-primaryText/70">
                            {alert.thresholdType === "AQI" ? (
                              <>
                                AQI {alert.aqiCondition === "greater" ? ">" : "<"} {alert.aqiValue}
                              </>
                            ) : (
                              <>
                                AQI {alert.durationCondition === "greater" ? ">" : "<"} {alert.durationAqiValue} for {alert.durationHours} hours
                              </>
                            )}
                          </dd>
                          <dt className="sr-only md:hidden">{t("manage_alert.created_at")}</dt>
                          <dd className="md:hidden text-primaryText/70">
                            {alert.createdAt
                              ? new Date(alert.createdAt).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </dl>
                      </td>
                      <td className="hidden lg:table-cell text-center px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {alert.location}
                      </td>
                      <td className="hidden sm:table-cell text-center px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {alert.pollutantName}
                      </td>
                      <td className="hidden sm:table-cell text-center px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                            AQI {alert.aqiCondition === "greater" ? ">" : "<"} {alert.aqiValue}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        <button
                          onClick={() => handleToggleStatus(alert._id)}
                          className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                            alert.status ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full shadow-md"
                            animate={{ x: alert.status ? 24 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          />
                        </button>
                      </td>
                      <td className="hidden md:table-cell text-center px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {alert.createdAt
                          ? new Date(alert.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-2 py-4 text-center whitespace-nowrap text-sm">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDelete(alert._id)}
                            className="text-danger hover:text-red-900 dark:hover:text-red-400 transition-colors"
                          >
                            <BsFillTrash3Fill className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(alert)}
                            className="text-success hover:text-red-900 dark:hover:text-red-400 transition-colors"
                          >
                            <BsPencilFill className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  {t("manage_alert.no_alerts")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <Modal
          modalClose={() => setModalOpen(false)}
          alertData={selectedAlert}
        />
      )}
    </div>
  );
};

export default ManageAlert;