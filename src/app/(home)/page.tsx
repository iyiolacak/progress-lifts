"use client";
import { useTranslations } from "next-intl";
import React from "react";
import { FlowTotem } from "./settings/components/flow-totem/FlowTotem";

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
