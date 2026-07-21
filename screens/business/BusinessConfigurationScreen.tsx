import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import Tabs from '@/components/Tabs';
import GeneralConfigTab from './GeneralConfigTab';
import NCFManagementTab from './NCFManagementTab';
import BackupsTab from './BackupsTab';
import ScheduledTasksTab from './ScheduledTasksTab';

const BusinessConfigurationScreen = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        tabs={[
          { key: 'general', label: 'General', content: <GeneralConfigTab /> },
          { key: 'ncf', label: 'NCF', content: <NCFManagementTab /> },
          { key: 'backups', label: 'Backups', content: <BackupsTab /> },
          { key: 'tasks', label: 'Tareas', content: <ScheduledTasksTab /> },
        ]}
      />
    </View>
  );
};

export default BusinessConfigurationScreen;
