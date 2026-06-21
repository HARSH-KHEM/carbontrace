"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { submitOnboarding, skipOnboarding, checkOnboardingStatus } from "@/lib/api";

const quizSteps = [
  {
    question: "How do you usually commute?",
    subtitle: "Your daily travel choice has the largest impact on your carbon footprint.",
    options: [
      { icon: "directions_car", label: "Car", sublabel: "Private Vehicle" },
      { icon: "pedal_bike", label: "Bike", sublabel: "Carbon-free cycle" },
      { icon: "directions_bus", label: "Transport", sublabel: "Bus, Rail, Subway" },
      { icon: "directions_walk", label: "Walk", sublabel: "Nature's pace" },
    ],
  },
  {
    question: "What describes your diet best?",
    subtitle: "Food production accounts for ~26% of global greenhouse gas emissions.",
    options: [
      { icon: "restaurant", label: "Omnivore", sublabel: "Regular meat eater" },
      { icon: "spa", label: "Flexitarian", sublabel: "Occasional meat" },
      { icon: "eco", label: "Vegetarian", sublabel: "No meat" },
      { icon: "local_florist", label: "Vegan", sublabel: "Plant-based only" },
    ],
  },
  {
    question: "How is your home powered?",
    subtitle: "Energy source determines up to 40% of your residential carbon output.",
    options: [
      { icon: "bolt", label: "Grid Power", sublabel: "Standard utility" },
      { icon: "solar_power", label: "Solar", sublabel: "Rooftop panels" },
      { icon: "wind_power", label: "Wind", sublabel: "Green energy plan" },
      { icon: "home", label: "Mixed", sublabel: "Hybrid sources" },
    ],
  },
];

function OptionCard({ icon, label, sublabel, isSelected, onClick }) {
  return (
    <button
      className={`option-card glass-card flex items-center gap-md p-md rounded-xl text-left group ${
        isSelected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary transition-transform group-hover:scale-110">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <div className="font-headline-md text-[18px] font-semibold">{label}</div>
        <div className="font-label-sm text-label-sm text-on-surface-variant">{sublabel}</div>
      </div>
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const bgRef = useRef(null);

  const totalSteps = quizSteps.length;
  const step = quizSteps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    async function checkStatus() {
      const isCompleted = await checkOnboardingStatus();
      if (isCompleted) {
        router.push("/dashboard");
      }
    }
    checkStatus();
  }, [router]);

  const handleSelectOption = (optionLabel) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentStep]: optionLabel,
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const payload = {
        commute_type: selectedOptions[0]?.toLowerCase(),
        diet_type: selectedOptions[1]?.toLowerCase(),
        heating_type: selectedOptions[2]?.toLowerCase()
      };
      await submitOnboarding(payload);
      router.push("/dashboard");
    }
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.push("/dashboard");
  };

  // Parallax background effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (bgRef.current) {
        bgRef.current.style.transform = `scale(1.05) translate(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px)`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Background */}
      <div
        ref={bgRef}
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-100"
        style={{
          backgroundImage:
            "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCUvSzijAohrNMNm8NICyu3jBYr9dIjuibGwUmqWJkDLMM0xt31SO6LQ6HgHK_pk6qRCsCJBZfR8CjXkU5Z18rUPNEnZUhs0gEDJHumQpWrC_WKzF0k1eWttpi6uumbvKHu8Hhn6JwCqtFH9wYo69BGc9Cc5jAY2uUHLTc9o5j_3EukkSnC3ACRf4jHtLiLWpj1DiP9xJrCgsaVLWLMLWnZ1FoCHqyUKDKwTJ8YsJzCb1Shoont2JAq2Hlghppi9kBVUvhcTq20OTef)",
        }}
      >
        <div className="absolute inset-0 forest-overlay opacity-80"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-grow w-full flex items-center justify-center px-4 md:px-0 py-xl">
        <div className="w-[90%] md:w-[576px] mx-auto z-10">
          {/* Logo */}
          <div className="flex justify-center mb-xl">
            <div className="flex items-center gap-sm">
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
              <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                CarbonTrace
              </h1>
            </div>
          </div>

          {/* Step Card */}
          <div className="glass-card rounded-[24px] p-lg md:p-xl relative overflow-hidden w-full">
            {/* Progress */}
            <div className="mb-xl">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Onboarding Quiz
                </span>
                <span className="font-label-sm text-label-sm text-primary">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container glow-primary transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-lg">
              <header>
                <h2 className="font-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-xs">
                  {step.question}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">{step.subtitle}</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {step.options.map((option) => (
                  <OptionCard
                    key={option.label}
                    icon={option.icon}
                    label={option.label}
                    sublabel={option.sublabel}
                    isSelected={selectedOptions[currentStep] === option.label}
                    onClick={() => handleSelectOption(option.label)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-xl pt-lg border-t border-white/5 flex justify-between items-center">
              <button
                onClick={handleSkip}
                className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md flex items-center gap-xs"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="bg-primary-container text-on-primary-container px-xl py-md rounded-full font-headline-md text-[16px] font-bold glow-primary hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-sm"
              >
                {currentStep < totalSteps - 1 ? "Next Step" : "Finish"}
                <span className="material-symbols-outlined">
                  {currentStep < totalSteps - 1 ? "arrow_forward" : "check"}
                </span>
              </button>
            </div>
          </div>

          <p className="text-center mt-lg font-label-sm text-label-sm text-on-surface-variant/60">
            Data helps us calibrate your initial Earth Impact Score.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-lg py-xl flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant/60">
            © 2024 CarbonTrace. All rights reserved.
          </p>
          <div className="flex gap-lg">
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Impact Report
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
