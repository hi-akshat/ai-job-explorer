import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Navigation from '@/components/Navigation';
import JobExplorer from '@/components/JobExplorer';
import BarChart from '@/components/BarChart';
import GaugeChart from '@/components/GaugeChart';
import IsotypeChart from '@/components/IsotypeChart';
import TimelineChart from '@/components/TimelineChart';
import RadarChart from '@/components/RadarChart';
import BubbleChart from '@/components/BubbleChart';
import HeatMap from '@/components/HeatMap';
import TrendChart from '@/components/TrendChart';
import { Card, CardContent } from '@/components/ui/card';
import jobData, { sectorData, skillsData, timelineEvents } from '@/data/jobData';
import { ChevronDown, ArrowRight, Brain, Zap, Users, TrendingUp, BookOpen } from 'lucide-react';

// Mock data for future trends
const futureProjections = [
  { year: 2023, value: 30, label: 'Generative AI adoption begins', category: 'Jobs Lost' },
  { year: 2025, value: 45, label: 'Routine task automation accelerates', category: 'Jobs Lost' },
  { year: 2027, value: 65, label: 'Mass transformation of knowledge work', category: 'Jobs Lost' },
  { year: 2030, value: 85, label: 'AI-powered automation mature', category: 'Jobs Lost' },

  { year: 2023, value: 20, label: 'AI knowledge jobs emerge', category: 'Jobs Created' },
  { year: 2025, value: 35, label: 'New AI-adjacent roles expand', category: 'Jobs Created' },
  { year: 2027, value: 60, label: 'AI integration specialists in demand', category: 'Jobs Created' },
  { year: 2030, value: 95, label: 'AI-native job ecosystem matures', category: 'Jobs Created' },

  { year: 2023, value: 15, label: 'Early adopters pursue reskilling', category: 'Workers Needing Reskilling' },
  { year: 2025, value: 30, label: 'Mid-career professionals affected', category: 'Workers Needing Reskilling' },
  { year: 2027, value: 40, label: 'Technical workforce transforms', category: 'Workers Needing Reskilling' },
  { year: 2030, value: 50, label: 'Half of global workforce reskilled', category: 'Workers Needing Reskilling' },
];

// Data for domain impact heatmap
const domainSkillsHeatmap = [
  { x: 'Finance', y: 'Data Processing', value: 95, tooltip: 'Almost complete automation potential' },
  { x: 'Finance', y: 'Customer Service', value: 75, tooltip: 'High automation with exception handling' },
  { x: 'Finance', y: 'Analysis', value: 65, tooltip: 'Significant AI augmentation' },
  { x: 'Finance', y: 'Strategy', value: 40, tooltip: 'Human oversight still critical' },
  { x: 'Finance', y: 'Relationship', value: 25, tooltip: 'Human touch remains essential' },

  { x: 'Healthcare', y: 'Data Processing', value: 90, tooltip: 'Records and data management automated' },
  { x: 'Healthcare', y: 'Customer Service', value: 50, tooltip: 'Blend of AI and human touch needed' },
  { x: 'Healthcare', y: 'Analysis', value: 45, tooltip: 'AI assisting with diagnostics' },
  { x: 'Healthcare', y: 'Strategy', value: 20, tooltip: 'Human medical judgment essential' },
  { x: 'Healthcare', y: 'Relationship', value: 10, tooltip: 'Patient care remains human-centered' },

  { x: 'Retail', y: 'Data Processing', value: 95, tooltip: 'Inventory and ordering automated' },
  { x: 'Retail', y: 'Customer Service', value: 80, tooltip: 'Most interactions handled by AI' },
  { x: 'Retail', y: 'Analysis', value: 70, tooltip: 'AI-driven customer insights dominant' },
  { x: 'Retail', y: 'Strategy', value: 50, tooltip: 'AI increasingly guiding business decisions' },
  { x: 'Retail', y: 'Relationship', value: 40, tooltip: 'Personalized AI engagements growing' },

  { x: 'Education', y: 'Data Processing', value: 85, tooltip: 'Administrative tasks automated' },
  { x: 'Education', y: 'Customer Service', value: 40, tooltip: 'Student support partially automated' },
  { x: 'Education', y: 'Analysis', value: 35, tooltip: 'Learning analytics AI-augmented' },
  { x: 'Education', y: 'Strategy', value: 25, tooltip: 'Curriculum development human-guided' },
  { x: 'Education', y: 'Relationship', value: 15, tooltip: 'Teacher-student bonds remain essential' },

  { x: 'Technology', y: 'Data Processing', value: 90, tooltip: 'Data pipeline automation near-complete' },
  { x: 'Technology', y: 'Customer Service', value: 75, tooltip: 'AI handling most technical support' },
  { x: 'Technology', y: 'Analysis', value: 50, tooltip: 'Complex analysis human-AI collaboration' },
  { x: 'Technology', y: 'Strategy', value: 35, tooltip: 'AI informing but not driving strategy' },
  { x: 'Technology', y: 'Relationship', value: 30, tooltip: 'Client relationships increasingly digital' },
];

// Transform skills data for radar chart
const prepareSkillsData = () => {
  return skillsData.reduce((acc, category) => {
    category.skills.forEach(skill => {
      const existing = acc.find(item => item.skill === skill.name);
      if (existing) {
        existing[category.category] = skill.value;
      } else {
        acc.push({
          skill: skill.name,
          [category.category]: skill.value
        });
      }
    });
    return acc;
  }, [] as any[]);
};

// Data for bubble chart visualization
const bubbleData = [
  { id: "1", value: 85, label: "Data Entry", category: "Administrative", description: "85% automation risk" },
  { id: "2", value: 80, label: "Call Centers", category: "Customer Service", description: "80% automation risk" },
  { id: "3", value: 73, label: "Bookkeeping", category: "Finance", description: "73% automation risk" },
  { id: "4", value: 69, label: "Market Research", category: "Marketing", description: "69% automation risk" },
  { id: "5", value: 65, label: "Software Dev", category: "Technology", description: "65% automation risk" },
  { id: "6", value: 58, label: "Design", category: "Creative", description: "58% automation risk" },
  { id: "7", value: 50, label: "Financial Analysis", category: "Finance", description: "50% automation risk" },
  { id: "8", value: 42, label: "Radiology", category: "Healthcare", description: "42% automation risk" },
  { id: "9", value: 36, label: "Content Creation", category: "Creative", description: "36% automation risk" },
  { id: "10", value: 26, label: "Teaching", category: "Education", description: "26% automation risk" },
  { id: "11", value: 15, label: "Nursing", category: "Healthcare", description: "15% automation risk" },
  { id: "12", value: 10, label: "Therapy", category: "Healthcare", description: "10% automation risk" }
];

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight / 2 && sectionTop > -window.innerHeight / 2) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      {/* Hero Section */}
      <section
        id="intro"
        ref={heroRef}
        className="flex flex-col justify-center items-center pt-0 pb-0 min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 50%, #F5F3FF 100%)'
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-64 h-64 rounded-full bg-indigo-200/20 -top-10 -left-10 blur-3xl"></div>
          <div className="absolute w-80 h-80 rounded-full bg-blue-200/30 top-40 -right-20 blur-3xl"></div>
          <div className="absolute w-64 h-64 rounded-full bg-purple-200/20 bottom-10 left-1/3 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
              How Fast Will AI<br />Take Your Job?
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-slate-700 animate-fade-in animation-delay-300 max-w-3xl mx-auto leading-relaxed">
              An interactive exploration of artificial intelligence's impact on the future of work and what it means for your career.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="stat-card animate-fade-in animation-delay-500">
                <div className="stat-icon text-4xl mb-2">
                  <Zap className="w-12 h-12 text-indigo-500 mx-auto" />
                </div>
                <h3 className="card-heading">Work Hours Automated</h3>
                <p className="card-value">30%</p>
                <p className="text-sm text-gray-600">by 2030 (McKinsey)</p>
              </div>

              <div className="stat-card animate-fade-in animation-delay-600">
                <div className="stat-icon text-4xl mb-2">
                  <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto" />
                </div>
                <h3 className="card-heading">Net Job Change</h3>
                <p className="card-value text-emerald-500">+78M</p>
                <p className="text-sm text-gray-600">globally by 2025 (WEF)</p>
              </div>

              <div className="stat-card animate-fade-in animation-delay-700">
                <div className="stat-icon text-4xl mb-2">
                  <BookOpen className="w-12 h-12 text-blue-500 mx-auto" />
                </div>
                <h3 className="card-heading">Workers Needing Reskilling</h3>
                <p className="card-value text-blue-500">50%</p>
                <p className="text-sm text-gray-600">by 2030</p>
              </div>
            </div>

            <Button
              onClick={() => document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-fade-in animation-delay-1000 gradient-btn text-base group"
            >
              Explore Your Job's Future
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-fade-in animation-delay-1000">
              <ChevronDown className="w-6 h-6 text-indigo-600 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Job Explorer Section */}
      <section id="explorer" className="min-h-screen flex flex-col justify-center py-0">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <h2 className="section-heading">Interactive Job Explorer</h2>
          <p className="section-subheading">
            Search for your job title to discover how artificial intelligence might impact your role in the coming years.
          </p>

          <div className="max-w-5xl mx-auto">
            <JobExplorer />
          </div>
        </div>
      </section>

      {/* Domain Impact Section */}
      <section id="domains" className="py-28" style={{
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 50%, #EFF6FF 100%)'
      }}>
        <div className="container mx-auto px-4">
          <h2 className="section-heading">Domain & Skill Impact Analysis</h2>
          <p className="section-subheading">
            Explore which domains and skill types face the highest automation risk from artificial intelligence.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 glass-card">
              <h3 className="text-xl font-semibold mb-4 text-center">Finance has the highest number of jobs that can be automated</h3>
              <BarChart
                data={sectorData}
                subtitle="Percentage of tasks that could be automated by 2030"
                height={300}
              />
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Data Processing seems to be impacted in every domain </h3>
              <HeatMap
                data={domainSkillsHeatmap}
                xLabel="Industry Domain"
                yLabel="Skill Type"
                colorScheme={['#EEF2FF', '#9381FF']}
                subtitle="Heatmap of Automation Risk of Skill types by Domain"
              />
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12">
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Job Automation Risk Landscape</h3>
              <BubbleChart
                data={bubbleData}
                height={500}
              />
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-3 text-center">Key Insights</h3>
              <ul className="list-none space-y-4 flex-grow">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 mr-3">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-900">Pattern Recognition</h4>
                    <p className="text-sm text-slate-600">Jobs with repetitive pattern analysis face 80-95% automation risk, including data entry, basic accounting, and claims processing.</p>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-900">Human Connection</h4>
                    <p className="text-sm text-slate-600">Roles requiring emotional intelligence, empathy, and complex interpersonal dynamics face only 9-15% automation risk.</p>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 mr-3">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-900">Growth Areas</h4>
                    <p className="text-sm text-slate-600">STEM fields are projected to grow 23% by 2030 despite AI, while healthcare is expected to add 3-4 million jobs in the U.S. alone.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Future Trends Section */}
      <section id="trends" className="py-28">
        <div className="container mx-auto px-4">
          <h2 className="section-heading">Future AI Trends & Projections</h2>
          <p className="section-subheading">
            How the employment landscape will evolve through 2030 with the continued advancement of AI technologies.
          </p>

          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-6 mb-12">
              {/* <h3 className="text-xl font-semibold mb-4 text-center">AI Impact Timeline (2023-2030)</h3> */}
              <TrendChart
                data={futureProjections}
                height={450}
              />
            </div>

            <div className="mb-12">
              <TimelineChart
                events={timelineEvents}
                title="AI Adoption Timeline"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Generative AI Impact</h3>
                <div className="flex justify-center">
                  <GaugeChart percentage={65} size={200} />
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  65-70% of knowledge work tasks could be automated or augmented by generative AI technology by 2030.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Emerging AI Roles</h3>
                <ul className="space-y-3 pl-0 list-none">
                  {[
                    { title: "AI Ethics Specialist", desc: "Ensuring ethical AI deployment" },
                    { title: "Human-AI Collaboration Coach", desc: "Optimizing human-AI teamwork" },
                    { title: "Prompt Engineer", desc: "Crafting optimal AI inputs" },
                    { title: "AI Systems Interpreter", desc: "Explaining AI decisions" },
                    { title: "Automation Manager", desc: "Overseeing AI-human workflows" },
                  ].map((role, idx) => (
                    <li key={idx} className="flex items-center p-2 rounded-lg transition-colors hover:bg-indigo-50">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-indigo-600 font-medium">{idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{role.title}</h4>
                        <p className="text-xs text-slate-600">{role.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Reskilling Need</h3>
                <div className="flex items-center justify-center mb-4">
                  <IsotypeChart
                    percentage={50}
                    icon="👨‍💼"
                    rows={5}
                    columns={10}
                    description="Half of all workers will need significant reskilling by 2030"
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                    World Economic Forum
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="action" className="py-28" style={{
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 50%, #EFF6FF 100%)'
      }}>
        <div className="container mx-auto px-4">
          <h2 className="section-heading">What Can You Do?</h2>
          <p className="section-subheading">
            Practical steps to prepare yourself for an AI-transformed workplace and protect your career.
          </p>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="glass-card p-6 flex flex-col items-center text-center h-full">
                <div className="mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-2xl">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Routine Task Workers</h3>
                <p className="text-gray-700 flex-grow">
                  Focus on upskilling in areas that require human creativity, judgment, and interpersonal skills that AI cannot easily replicate.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <h4 className="font-medium text-sm mb-2 text-slate-700">Suggested Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Creative problem solving</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Human collaboration</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">AI tool proficiency</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center h-full">
                <div className="mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-2xl">
                  <span className="text-4xl">💻</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Knowledge Workers</h3>
                <p className="text-gray-700 flex-grow">
                  Learn to collaborate effectively with AI tools to enhance your productivity, focusing on higher-level analysis and strategy that AI cannot provide.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <h4 className="font-medium text-sm mb-2 text-slate-700">Suggested Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Prompt engineering</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Critical analysis</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Strategic thinking</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center h-full">
                <div className="mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl">
                  <span className="text-4xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Creative Workers</h3>
                <p className="text-gray-700 flex-grow">
                  Develop unique human perspectives and emotional intelligence that AI cannot easily replicate, while using AI tools to handle routine aspects of creative work.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <h4 className="font-medium text-sm mb-2 text-slate-700">Suggested Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Original ideation</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Cultural context</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">AI collaboration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Key Takeaways for the AI Age</h3>
              <ul className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">AI reshapes rather than just replaces</h4>
                    <p className="text-gray-700">Most jobs will transform rather than disappear entirely. Focus on adapting and finding your value-add alongside AI systems.</p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Continuous learning is essential</h4>
                    <p className="text-gray-700">Regular upskilling will be necessary throughout your career. Dedicate time to learning new tools and technologies as they emerge.</p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Human skills gain value</h4>
                    <p className="text-gray-700">Creativity, empathy, and complex problem-solving become more valuable as routine tasks are automated. Develop these skills deliberately.</p>
                  </div>
                </li>

                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Adapt to collaboration</h4>
                    <p className="text-gray-700">Learning to work alongside AI tools will be crucial for future employability. Practice integrating AI into your workflow now.</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.weforum.org/reports/the-future-of-jobs-report-2023/', '_blank')}
                  className="flex items-center gap-2"
                >
                  WEF Future of Jobs Report
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.mckinsey.com/featured-insights/mckinsey-on-ai/the-economic-potential-of-generative-ai-the-next-productivity-frontier', '_blank')}
                  className="flex items-center gap-2"
                >
                  McKinsey AI Impact Analysis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              How Fast Will AI Take Your Job?
            </h3>
            <p className="mb-8">INFO 247: Information Visualization and Presentation</p>
            <p className="mb-8">Created by Akshat Gupta & VikramSingh Rathod</p>


            <div className="max-w-xl mx-auto mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>

            <div className="text-sm text-gray-400">
              <p className="mb-2">Data sources: McKinsey Global Institute, World Economic Forum, Oxford University Research, Kaggle </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-white shadow-lg border border-gray-200 z-50 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronDown className="w-5 h-5 text-gray-700 transform rotate-180" />
      </button>


    </div>
  );
};

export default Index;
