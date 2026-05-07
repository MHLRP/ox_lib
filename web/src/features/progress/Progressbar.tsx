import React, { useEffect } from 'react';
import { Box, createStyles, Text } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { ProgressbarProps } from '../../typings';

const useStyles = createStyles((theme) => ({
  container: {
    position: 'relative',
    width: 'max-content',
    height: 40,
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(65,17,142,0.75) 50%, rgba(0,0,0,0) 100%)',
    border: '0.1vh solid #41118E',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    gap: 2,
  },
  wrapper: {
    width: '100%',
    height: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
  },
  tickOuter: {
    border: 0,
    height: 20,
    width: 20,
    outline: 'none',
    backgroundColor: '#41118E',
    cursor: 'pointer',
    position: 'relative',
    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 50%)',
  },
  tickInner: {
    position: 'absolute',
    top: '0.2vh',
    left: '0.2vh',
    right: '0.2vh',
    bottom: '0.2vh',
    backgroundColor: '#0C0A19',
    clipPath: 'inherit',
    color: 'inherit',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.colors[theme.primaryColor][theme.fn.primaryShade()],
  },
  label: {
    position: 'absolute',
    top: '-92%',
    maxWidth: 350,
    padding: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: 20,
    color: '#13EBFD',
    textShadow: '0 0 4px #13EBFD',
  },
  percent: {
    position: 'absolute',
    top: '-92%',
    right: 0,
    maxWidth: 350,
    padding: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: 20,
    color: '#13EBFD',
    textShadow: '0 0 4px #13EBFD',
  },
}));

const Progressbar: React.FC = () => {
  const { classes } = useStyles();
  const [visible, setVisible] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [duration, setDuration] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const interval = React.useRef<NodeJS.Timeout>();

  useNuiEvent('progressCancel', () => setVisible(false));

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    setProgress(0);
    setVisible(true);
    setLabel(data.label);
    setDuration(data.duration);
  });

  useEffect(() => {
    if (duration === 0 || !visible) return;

    const startTime = Date.now();

    interval.current = setInterval(() => {
      const currentTime = Date.now();
      const percent = (currentTime - startTime) / duration;
      setProgress(percent);

      if (percent >= 1) {
        setTimeout(() => {
          clearInterval(interval.current);
          setVisible(false);
          setProgress(0);
          setDuration(0);
        }, 100);
        return;
      }
    }, 100);

    return () => {
      clearInterval(interval.current);
    };
  }, [visible]);

  const clamp = (num: number, min: number, max: number) => {
    return num > max ? max : num < min ? min : num;
  };

  return (
    <>
      <Box className={classes.wrapper}>
        <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
          <Box className={classes.container}>
            <Text className={classes.label}>{label}</Text>
            <Text className={classes.percent}>{clamp(Math.floor(((20 * progress) / 20) * 100), 0, 100)}%</Text>
            {Array.from({ length: 20 }).map((_, index) => {
              return (
                <Box key={'cyberProg:' + index} className={classes.tickOuter}>
                  <Box
                    className={classes.tickInner}
                    style={index + 1 <= Math.floor(20 * progress) ? { background: '#41118E' } : {}}
                  ></Box>
                </Box>
              );
            })}
          </Box>
        </ScaleFade>
      </Box>
    </>
  );

  // return (
  //   <>
  //     <Box className={classes.wrapper}>
  //       <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
  //         <Box className={classes.container}>
  //           <Box
  //             className={classes.bar}
  //             onAnimationEnd={() => setVisible(false)}
  //             sx={{
  //               animation: 'progress-bar linear',
  //               animationDuration: `${duration}ms`,
  //             }}
  //           >
  //             <Box className={classes.labelWrapper}>
  //               <Text className={classes.label}>{label}</Text>
  //             </Box>
  //           </Box>
  //         </Box>
  //       </ScaleFade>
  //     </Box>
  //   </>
  // );
};

export default Progressbar;
