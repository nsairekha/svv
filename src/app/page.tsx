"use client";

import { useState } from "react";
import { HiX, HiArrowRight, HiArrowUp, HiDocumentText, HiChartBar, HiUsers, HiPlus } from "react-icons/hi";
import { FaGlobe, FaRocket, FaCity, FaTools } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import "./styles.css";

export default function Home() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [openFaq, setOpenFaq] = useState(1); // Second FAQ is open by default (index 1)

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      {bannerVisible && (
        <div className="bg-[#2563eb] text-white px-6 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FaRocket className="text-red-400" />
            <span>Report city issues 24/7 • Help improve your community</span>
            <HiArrowRight className="ml-2" />
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="hover:opacity-70 transition-opacity"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-white px-6 py-4 flex items-center justify-between relative">
        <div className="text-2xl font-bold text-[#2563eb]">Sudhaar</div>
        <div className="hidden md:flex items-center gap-8 text-gray-700 absolute left-1/2 transform -translate-x-1/2">
          <a href="#" className="hover:text-[#2563eb] transition-colors">
            Report Issues
          </a>

          <a href="#" className="hover:text-[#2563eb] transition-colors">
            About Us
          </a>
          <a href="#" className="hover:text-[#2563eb] transition-colors">
            Statistics
          </a>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <a href="#" className="text-gray-700 hover:text-[#2563eb] transition-colors">
            Login
          </a>
          <button className="bg-[#2563eb] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#1e40af] transition-colors">
            Sign Up <HiArrowRight />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Hero Content */}
          <div className="space-y-8">
            <div className="text-[#2563eb] text-sm font-semibold uppercase tracking-wide">
              START REPORTING
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Help Build a Better City
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Report potholes, broken streetlights, water leaks, garbage collection issues, and more. Track your submissions in real-time and see how your city is improving.
            </p>
            <button className="bg-[#2563eb] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#1e40af] transition-colors">
              Report Now
            </button>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-700 font-semibold">4.8</span>
              <span className="text-gray-600">
                from 5,000+ <span className="underline">citizens</span>
              </span>
            </div>
          </div>

          {/* Right Section - Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Left - Mobile App Visual */}
            <div className="bg-gray-200 rounded-lg p-6 flex items-center justify-center relative overflow-hidden min-h-[280px]">
              <div className="absolute top-4 right-4 space-y-2">
                <div className="w-12 h-1 bg-white rounded"></div>
                <div className="w-8 h-1 bg-white rounded"></div>
              </div>
              <div className="relative transform rotate-6">
                <div className="w-32 h-56 bg-black rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-1 bg-gray-50 rounded-2xl"></div>
                  <div className="absolute top-2 left-3 right-3 h-1 bg-gray-300 rounded-full"></div>
                  <div className="absolute top-8 left-3 right-3 space-y-2">
                    <div className="h-10 bg-blue-500 rounded-lg"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right - Currencies */}
            <div className="bg-[#f5e6d3] rounded-tl-2xl rounded-br-2xl p-6 flex flex-col justify-between relative min-h-[280px]">
              <div></div>
              <div>
                <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">12K+</div>
                <div className="text-lg font-semibold text-gray-900">Issues Resolved</div>
              </div>
              <div className="flex justify-end mt-4">
                <FaGlobe className="w-8 h-8 text-gray-700" />
              </div>
            </div>

            {/* Bottom Left - Users Active */}
            <div className="bg-[#dbeafe] rounded-tl-2xl rounded-br-2xl p-6 flex flex-col relative min-h-[280px]">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 bg-[#2563eb] rounded-full"></div>
                <div className="w-3 h-3 bg-[#2563eb] rounded-full"></div>
              </div>
              <div className="mt-12 flex-grow flex flex-col justify-between">
                <div className="text-lg font-semibold text-gray-900 mb-6">
                  Active Users
                </div>
                <div className="flex items-center -space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                  <div className="w-12 h-12 bg-[#2563eb] rounded-full border-2 border-white flex items-center justify-center">
                    <HiArrowRight className="text-white w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right - Saving */}
            <div className="bg-[#2563eb] rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl lg:text-5xl font-bold text-white">2,850</div>
                <HiArrowUp className="text-white w-6 h-6" />
              </div>
              <div className="mt-auto">
                <div className="h-24 relative mb-3">
                  {/* Simple line chart representation */}
                  <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <polyline
                      points="0,50 10,45 20,40 30,35 40,30 50,25 60,20 70,15 80,10 90,5 100,0"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-white font-semibold text-right">Resolved This Month</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">ABOUT US</div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            One platform for all your{" "}
            <span className="font-serif italic text-6xl lg:text-7xl font-bold">city</span>{" "}
            improvements
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Remove all the friction that stands in the way of your community goals.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Block - Track Progress */}
          <div className="bg-[#2563eb] rounded-tl-3xl rounded-br-3xl p-5 lg:p-8 relative overflow-hidden min-h-[260px] flex flex-col">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Track Resolution Progress
            </h3>
            
            {/* Bar Chart Visualization */}
            <div className="flex-grow flex items-end gap-2 mb-4 relative">
              {/* Bars */}
              <div className="flex items-end gap-2 flex-grow mb-8">
                <div className="bg-blue-200 h-10 w-8 rounded-t"></div>
                <div className="bg-blue-200 h-16 w-8 rounded-t"></div>
                <div className="bg-blue-200 h-20 w-8 rounded-t"></div>
                <div className="bg-blue-200 h-24 w-8 rounded-t"></div>
              </div>
              
              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <div className="text-white text-2xl font-bold mb-1">12,000</div>
                <svg
                  className="w-8 h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 100 150"
                >
                  <path d="M50 10 L10 140 L90 140 Z" stroke="white" strokeWidth="8" fill="white" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Block - Global Reach */}
          <div className="bg-[#e0f2fe] rounded-tr-3xl rounded-bl-3xl p-5 lg:p-8 relative overflow-hidden min-h-[260px] flex flex-col">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Report from Anywhere
            </h3>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-2 border-blue-600 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-blue-400 rounded-full"></div>
              </div>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-between">
              {/* Top Section - Submission Card */}
              <div className="flex justify-start mb-2">
                <div className="bg-white rounded-lg shadow-lg p-2.5 max-w-[160px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <HiDocumentText className="text-blue-600 w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">25,000</div>
                      <div className="text-xs text-gray-600">Reports Sent</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    <div className="w-5 h-5 bg-blue-400 rounded-full border-2 border-white"></div>
                    <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white -ml-2"></div>
                  </div>
                </div>
              </div>

              {/* Center - Globe */}
              <div className="flex justify-center items-center my-2">
                <div className="relative">
                  <FaGlobe className="w-20 h-20 text-blue-600 opacity-80" />
                  {/* Wireframe effect */}
                  <svg
                    className="absolute inset-0 w-20 h-20"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="50" cy="50" r="45" className="text-blue-600" />
                    <ellipse cx="50" cy="50" rx="45" ry="20" className="text-blue-600" />
                    <ellipse cx="50" cy="50" rx="20" ry="45" className="text-blue-600" />
                    <line x1="50" y1="5" x2="50" y2="95" className="text-blue-600" />
                    <line x1="5" y1="50" x2="95" y2="50" className="text-blue-600" />
                  </svg>
                </div>
              </div>

              {/* Bottom Section - Resolution Card */}
              <div className="flex justify-end">
                <div className="bg-[#2563eb] rounded-lg shadow-lg p-2.5 max-w-[160px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">40,000</div>
                      <div className="text-xs text-blue-100">Issues Fixed</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    <div className="w-5 h-5 bg-blue-300 rounded-full border-2 border-blue-500"></div>
                  </div>
                </div>
              </div>

              {/* Flags at bottom */}
              <div className="flex justify-end gap-1.5 mt-2">
                <div className="w-6 h-6 bg-gradient-to-b from-red-600 via-white to-blue-600 rounded-full border-2 border-gray-300"></div>
                <div className="w-6 h-6 bg-gradient-to-b from-yellow-500 via-red-600 to-black rounded-full border-2 border-gray-300"></div>
                <div className="w-6 h-6 bg-gradient-to-b from-green-600 via-white to-green-600 rounded-full border-2 border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-8">OUR MISSION</div>
        </div>

        {/* Main Heading and Description */}
        <div className="mb-12 max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Make Your City, Well-maintained
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            Empower citizens to report infrastructure issues and track real-time resolutions with our transparent, tech-enabled community reporting system.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 - Easy Reporting */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <HiDocumentText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Reporting</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Citizens can quickly report issues like potholes, broken lights, water leaks, and sanitation problems through a simple mobile-first interface.
            </p>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors group">
              <HiArrowRight className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
            </button>
          </div>

          {/* Card 2 - Real-time Tracking */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <HiChartBar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Track your submitted reports and receive live updates on status, estimated resolution time, and actions taken by municipal teams.
            </p>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors group">
              <HiArrowRight className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
            </button>
          </div>

          {/* Card 3 - Community Impact */}
          <div className="bg-[#dbeafe] rounded-2xl p-6 lg:p-8 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <HiUsers className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Impact</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              See the collective impact of citizen reports. Our dashboard shows resolved issues, improvements made, and how your city is getting better.
            </p>
            <button className="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center hover:bg-[#1e40af] transition-colors">
              <HiArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-[#2563eb] py-16 lg:py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 200">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="white"
            />
            <path
              d="M0,150 Q300,100 600,150 T1200,150 L1200,200 L0,200 Z"
              fill="white"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="text-sm uppercase tracking-wider text-blue-200 mb-4">IMPACT</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Growing community, building solutions
            </h2>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-6xl lg:text-7xl font-bold text-white mb-4">15K+</div>
              <div className="text-xl text-blue-100">Issues Resolved</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-6xl lg:text-7xl font-bold text-white mb-4">8,500+</div>
              <div className="text-xl text-blue-100">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Label and Heading */}
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">HELP CENTER</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Common questions about reporting
            </h2>
          </div>

          {/* Right Side - FAQ Items */}
          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? -1 : 0)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">How do I report an issue?</span>
                {openFaq === 0 ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFaq === 0 && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Simply download our app or visit our website, select the type of issue you want to report, provide location details and a description, and submit. You&apos;ll receive a confirmation and tracking number immediately.
                </p>
              )}
            </div>

            {/* FAQ 2 - Expanded by default */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? -1 : 1)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">What types of issues can I report?</span>
                {openFaq === 1 ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFaq === 1 && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  You can report potholes, broken streetlights, water leaks, sanitation problems, damaged sidewalks, traffic signal issues, park maintenance needs, and other public infrastructure concerns.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? -1 : 2)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">How long does it take to resolve an issue?</span>
                {openFaq === 2 ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFaq === 2 && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Resolution times vary depending on the issue type and severity. Simple fixes like potholes are typically addressed within 48-72 hours, while larger infrastructure projects may take several weeks. You&apos;ll receive status updates throughout the process.
                </p>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? -1 : 3)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">Can I track my report status?</span>
                {openFaq === 3 ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFaq === 3 && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Yes! Once you submit a report, you&apos;ll receive a unique tracking number. You can view real-time updates on your report&apos;s status through our app or website, including when it&apos;s received, assigned, in progress, and resolved.
                </p>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? -1 : 4)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">How is my feedback used?</span>
                {openFaq === 4 ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiPlus className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFaq === 4 && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Your reports help city officials prioritize maintenance work and allocate resources effectively. All reports are compiled into analytics dashboards that help identify patterns, improve response times, and make data-driven decisions to enhance city infrastructure.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2563eb] py-16 lg:py-24 relative overflow-hidden">
        {/* Decorative Stars */}
        <div className="absolute top-8 right-8 lg:top-12 lg:right-12 opacity-20">
          <div className="relative">
            <FaStar className="w-16 h-16 text-white absolute top-0 right-0" />
            <FaStar className="w-12 h-12 text-white absolute -top-2 -right-8 rotate-12" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Change the way your{" "}
                <span className="font-serif italic text-5xl lg:text-6xl font-bold">city</span>{" "}
                gets maintained
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed mb-8">
                Join thousands of citizens making a real difference. Together, we&apos;re building smarter, cleaner, and safer communities.
              </p>
              <button className="bg-white text-[#2563eb] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                Report Now <HiArrowRight />
              </button>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* City/Community Illustration */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Buildings/Infrastructure Icons */}
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <FaCity className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <FaTools className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-8">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <FaGlobe className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <HiUsers className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <FaStar className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center">
                      <HiChartBar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        {/* Upper Footer Section */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Column 1 - Citizen */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Citizen</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    My Reports
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Notifications
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Settings
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 - Support */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Report Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Troubleshooting
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 - City */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">City</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Statistics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Map View
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Announcements
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 - Organization */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">Organization</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    About Portal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Policies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#2563eb] transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Side - Logo, Address, Language */}
            <div className="md:col-span-1 lg:col-span-1">
              <div className="text-3xl font-bold text-[#2563eb] mb-6">Sudhaar</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                City Hall Civic Center<br />
                Municipal Office Building<br />
                Suite 202<br />
                Your City, State 12345
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Bottom Footer Section */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Sudhaar Municipal Government. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Data Protection
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
