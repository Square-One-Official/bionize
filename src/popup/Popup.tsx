import React, { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  QuickAccess,
  createQuickAccessItems,
  ProfileSelector,
  ReadingSection,
  VisionSection,
  TypographySection,
} from "@/components/features";
import { BookOpen, Eye, Type, Settings } from "lucide-react";
import type {
  BionizeSettings,
  AccessibilityProfile,
  ReadingSettings,
  VisionSettings,
  TypographySettings,
  DeepPartial,
} from "@/shared/types";
import {
  getSettings,
  saveSettings,
  getStateForUrl,
  setStateForUrl,
  getProfiles,
  applyProfile,
} from "@/shared/storage";

function Popup() {
  const [settings, setSettings] = useState<BionizeSettings | null>(null);
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(["reading"]);

  // Initialize component
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        // Get current tab URL
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const url = tabs[0]?.url || "";
        setCurrentUrl(url);

        // Get settings, state, and profiles
        const [settingsData, stateData, profilesData] = await Promise.all([
          getSettings(),
          getStateForUrl(url),
          getProfiles(),
        ]);

        setSettings(settingsData);
        setIsEnabled(stateData);
        setProfiles(profilesData);
        setExpandedSections(settingsData.ui.popupExpandedSections);
      } catch (error) {
        console.error("Error initializing popup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Notify content script of changes
  const notifyContentScript = useCallback(
    async (message: { action: string; [key: string]: unknown }) => {
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tabId = tabs[0]?.id;

        if (tabId) {
          await chrome.tabs.sendMessage(tabId, message);
        }
      } catch (error) {
        // Content script might not be loaded
        console.debug("Could not notify content script:", error);
      }
    },
    []
  );

  // Handle master toggle
  const handleToggleState = async () => {
    if (!currentUrl) return;

    const newState = !isEnabled;
    setIsEnabled(newState);

    try {
      await setStateForUrl(currentUrl, newState);
      await notifyContentScript({
        action: "toggleState",
        state: newState,
      });
    } catch (error) {
      console.error("Error toggling state:", error);
      setIsEnabled(!newState);
    }
  };

  // Handle settings change
  const handleSettingsChange = async (
    newSettings: DeepPartial<BionizeSettings>
  ) => {
    if (!settings) return;

    // Optimistically update UI
    const updatedSettings: BionizeSettings = {
      ...settings,
      reading: { ...settings.reading, ...(newSettings.reading || {}) },
      vision: { ...settings.vision, ...(newSettings.vision || {}) },
      typography: { ...settings.typography, ...(newSettings.typography || {}) },
      ui: {
        ...settings.ui,
        ...(newSettings.ui || {}),
        // Ensure quickToolbarFeatures is always a string array
        quickToolbarFeatures: newSettings.ui?.quickToolbarFeatures?.filter((f): f is string => f !== undefined) ||
          settings.ui.quickToolbarFeatures,
        popupExpandedSections: newSettings.ui?.popupExpandedSections?.filter((s): s is string => s !== undefined) ||
          settings.ui.popupExpandedSections,
      },
    };
    setSettings(updatedSettings);

    try {
      await saveSettings(newSettings);

      if (isEnabled) {
        await notifyContentScript({
          action: "updateSettings",
          settings: newSettings,
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  // Handle category-specific settings changes
  const handleReadingChange = (changes: Partial<ReadingSettings>) => {
    handleSettingsChange({ reading: changes });
  };

  const handleVisionChange = (changes: Partial<VisionSettings>) => {
    handleSettingsChange({ vision: changes });
  };

  const handleTypographyChange = (changes: Partial<TypographySettings>) => {
    handleSettingsChange({ typography: changes });
  };

  // Handle profile change
  const handleProfileChange = async (profileId: string | null) => {
    try {
      const newSettings = await applyProfile(profileId);
      setSettings(newSettings);

      if (isEnabled) {
        await notifyContentScript({
          action: "updateSettings",
          settings: newSettings,
        });
      }
    } catch (error) {
      console.error("Error applying profile:", error);
    }
  };

  // Handle accordion change
  const handleAccordionChange = (value: string[]) => {
    setExpandedSections(value);
    // Save expanded sections preference
    handleSettingsChange({
      ui: { popupExpandedSections: value },
    });
  };

  // Quick access handlers
  const quickAccessItems = settings
    ? createQuickAccessItems(
        {
          bionicEnabled: settings.reading.bionicEnabled,
          readingRulerEnabled: settings.reading.readingRulerEnabled,
          highContrastMode: settings.vision.highContrastMode,
          lineFocusEnabled: settings.reading.lineFocusEnabled,
        },
        {
          onToggleBionic: () =>
            handleReadingChange({
              bionicEnabled: !settings.reading.bionicEnabled,
            }),
          onToggleRuler: () =>
            handleReadingChange({
              readingRulerEnabled: !settings.reading.readingRulerEnabled,
            }),
          onToggleContrast: () =>
            handleVisionChange({
              highContrastMode:
                settings.vision.highContrastMode === "off" ? "dark" : "off",
            }),
          onToggleLineFocus: () =>
            handleReadingChange({
              lineFocusEnabled: !settings.reading.lineFocusEnabled,
            }),
        }
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] w-[360px] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[360px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Bionize</h1>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggleState}
          aria-label="Enable Bionize on this site"
        />
      </div>

      <Separator />

      {/* Quick Access */}
      <div className="px-5 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Quick Access
        </p>
        <QuickAccess items={quickAccessItems} />
      </div>

      <Separator />

      {/* Profile Selector */}
      <div className="px-5 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Profile
        </p>
        <ProfileSelector
          profiles={profiles}
          activeProfileId={settings?.activeProfileId || null}
          onProfileChange={handleProfileChange}
        />
      </div>

      <Separator />

      {/* Settings Accordion */}
      <div className="max-h-[320px] overflow-y-auto px-5 py-2">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={handleAccordionChange}
        >
          {/* Reading Section */}
          <AccordionItem value="reading">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Reading</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {settings && (
                <ReadingSection
                  settings={settings.reading}
                  onSettingsChange={handleReadingChange}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Vision Section */}
          <AccordionItem value="vision">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>Vision</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {settings && (
                <VisionSection
                  settings={settings.vision}
                  onSettingsChange={handleVisionChange}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Typography Section */}
          <AccordionItem value="typography">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span>Typography</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {settings && (
                <TypographySection
                  settings={settings.typography}
                  onSettingsChange={handleTypographyChange}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer */}
      <Separator />
      <div className="flex items-center justify-between px-5 py-3">
        <a
          href="chrome://extensions/?options=true"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>All Settings</span>
        </a>
        <a
          href="https://bionize.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          v{chrome.runtime.getManifest().version}
        </a>
      </div>
    </div>
  );
}

export default Popup;
