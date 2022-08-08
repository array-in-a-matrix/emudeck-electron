import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import ChangeLog from 'components/organisms/Wrappers/ChangeLog.js';

const ChangeLogPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { sudoPass } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setGyro = (data) => {
    if (data.target.value != '') {
      setState({
        ...state,
        ChangeLog: true,
      });
    } else {
      setState({
        ...state,
        ChangeLog: false,
      });
    }
  };

  const createSudo = (data) => {
    ipcChannel.sendMessage('bash', [
      'cp ~/emudeck/backend/tools/passwd.desktop ~/Desktop/passwd.desktop && chmod +x ~/Desktop/passwd.desktop && ~/Desktop/passwd.desktop && rm ~/Desktop/passwd.desktop ',
    ]);
  };

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (stdout) => {
      console.log({ stdout });
      stdout = stdout.replace('\n', '');
      stdout.includes('NP') ? (stdout = false) : (stdout = true);
      setStatePage({
        ...statePage,
        hasSudo: stdout,
      });
    });
  }, []);

  return (
    <ChangeLog
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setGyro}
      onClick={createSudo}
      hasSudo={hasSudo}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default ChangeLogPage;
