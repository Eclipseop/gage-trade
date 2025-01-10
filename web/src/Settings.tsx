import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { getApi } from "./util/electron";

const Settings = () => {
  const [league, setLeague] = useState("standard");
  const [keybind, setKeybind] = useState("");
  const api = getApi();

  useEffect(() => {
    api.send("get-settings", {});
    api.receive("settings-data", (data: string) => {
      const settings = JSON.parse(data);
      setLeague(settings.league || "Standard");
      setKeybind(settings.keybind || "D");
    });
  }, [api]);

  const saveSettings = (newSettings: { league: string; keybind: string }) => {
    api.send("save-settings", newSettings);
  };

  const handleLeagueChange = (value: string) => {
    setLeague(value);
    saveSettings({ league: value, keybind });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const pressedKey = e.key.toUpperCase();
    setKeybind(pressedKey);
    saveSettings({ league, keybind: pressedKey });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <Select value={league} onValueChange={handleLeagueChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Hardcore">Standard HC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keybind">Keybind</Label>
            <Input
              id="keybind"
              value={keybind}
              onKeyDown={handleKeyPress}
              placeholder="Press any key"
              className="w-full"
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
