"use client";
import { useTranslations } from "next-intl";
import React from "react";

const HomePage = () => {
  const t = useTranslations("HomePage");
  return (
    <>
      {/* on scroll, totem should be sticked */}
      <div className="flex flex-row gap-12 ">
      </div>
    </>
  );
};

export default HomePage;
