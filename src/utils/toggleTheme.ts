import { RPM_THEME_STORAGE_KEY } from '@/constants';

export const toggleTheme = ({ initialState, setInitialState }) => {
  const newTheme = initialState?.theme === 'realDark' ? 'light' : 'realDark';

  // Update localStorage
  localStorage.setItem(RPM_THEME_STORAGE_KEY, newTheme);

  // Update initial state
  setInitialState((prev) => ({
    ...prev,
    theme: newTheme,
  }));
};
