import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { SxProps } from '@mui/joy/styles/types';
import { Box, Button, ButtonGroup, FormControl, Typography } from '@mui/joy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PlusOneRoundedIcon from '@mui/icons-material/PlusOneRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

import { FormLabelStart } from '~/common/components/forms/FormLabelStart';
import { animationColorBeamScatter } from '~/common/util/animUtils';
import { copyToClipboard } from '~/common/util/clipboardUtils';
import { messageFragmentsReduceText } from '~/common/stores/chat/chat.message';
import { useLLMSelect } from '~/common/components/forms/useLLMSelect';

import { BeamStoreApi, useBeamStore } from '../store-beam.hooks';
import { BEAM_BTN_SX, SCATTER_COLOR, SCATTER_RAY_PRESETS } from '../beam.config';
import { BeamScatterDropdown } from './BeamScatterPaneDropdown';
import { beamPaneSx } from '../BeamCard';
import { useModuleBeamStore } from '../store-module-beam';


const scatterPaneSx: SxProps = {
  ...beamPaneSx,
  backgroundColor: 'background.popup',

  // col gap is pad/2 (8px), row is double (1rem)
  rowGap: 'var(--Pad)',

  boxShadow: '0px 6px 16px -12px rgb(var(--joy-palette-primary-darkChannel) / 50%)',
};

const mobileScatterPaneSx: SxProps = scatterPaneSx;

const desktopScatterPaneSx: SxProps = {
  ...scatterPaneSx,

  position: 'sticky',
  top: 0,
};


export function BeamScatterPane(props: {
  beamStore: BeamStoreApi,
  isMobile: boolean,
  rayCount: number,
  setRayCount: (n: number) => void,
  showRayAdd: boolean
  startEnabled: boolean,
  startBusy: boolean,
  onStart: () => void,
  onStop: () => void,
  onExplainerShow: () => any,
}) {

  const dropdownMemo = React.useMemo(() => (
    <BeamScatterDropdown
      beamStore={props.beamStore}
      onExplainerShow={props.onExplainerShow}
    />
  ), [props.beamStore, props.onExplainerShow]);

  // Добавляем setCurrentGatherLlmId в useBeamStore
  const { rays, currentGatherLlmId, setCurrentGatherLlmId } = useBeamStore(props.beamStore, useShallow(state => ({
    rays: state.rays,
    currentGatherLlmId: state.currentGatherLlmId,
    setCurrentGatherLlmId: state.setCurrentGatherLlmId,
  })));
  const gatherAutoStartAfterScatter = useModuleBeamStore(state => state.gatherAutoStartAfterScatter);
  const disableUnlessAutoStart = !props.startEnabled && !gatherAutoStartAfterScatter;
  const [_, gatherLlmComponent] = useLLMSelect(
    currentGatherLlmId, setCurrentGatherLlmId, props.isMobile ? '' : 'Merge Model', true, disableUnlessAutoStart,
  );

  const handleCopyAll = React.useCallback(() => {
    const allAnswers = rays
      .filter(ray => ray.message.fragments.length > 0)
      .map(ray => `【${messageFragmentsReduceText(ray.message.fragments)}】`)
      .join('\n');
    copyToClipboard(allAnswers, 'All Responses');
  }, [rays]);

  return (
    <Box sx={props.isMobile ? mobileScatterPaneSx : desktopScatterPaneSx}>

      {/* Title */}
      <Box>
        <Typography
          level='h4' component='h3'
          endDecorator={dropdownMemo}
        >
          {props.startBusy
            ? <AutoAwesomeIcon sx={{ fontSize: '1rem', mr: 0.625, animation: `${animationColorBeamScatter} 2s linear infinite` }} />
            : <AutoAwesomeOutlinedIcon sx={{ fontSize: '1rem', mr: 0.625 }} />}Beam
        </Typography>
        <Typography level='body-sm' sx={{ whiteSpace: 'nowrap' }}>
          Explore different replies
        </Typography>
      </Box>

      {/* Ray presets */}
      <FormControl sx={{ my: '-0.25rem' }}>
        <FormLabelStart title='Beam Count' sx={undefined} />
        <ButtonGroup variant='outlined'>
          {SCATTER_RAY_PRESETS.map((n) => {
            const isActive = n === props.rayCount;
            return (
              <Button
                key={n}
                color={isActive ? SCATTER_COLOR : 'neutral'}
                size='sm'
                onClick={() => props.setRayCount(n)}
                sx={{
                  backgroundColor: isActive ? `${SCATTER_COLOR}.softBg` : 'background.popup',
                  fontWeight: isActive ? 'xl' : 400,
                  width: '3rem',
                }}
              >
                {`x${n}`}
              </Button>
            );
          })}
          {props.showRayAdd && (
            <Button
              color='neutral'
              size='sm'
              onClick={() => props.setRayCount(props.rayCount + 1)}
              sx={{
                backgroundColor: 'background.popup',
                width: '3rem',
              }}
            >
              <PlusOneRoundedIcon />
            </Button>
          )}
        </ButtonGroup>
      </FormControl>

      {/* LLM */}
      <Box sx={{ my: '-0.25rem', minWidth: 190, maxWidth: 300 }}>
        {gatherLlmComponent}
      </Box>

      {/* Start / Stop buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Кнопка "Скопировать все" */}
        {!props.startBusy && (
          <Button
            variant='solid'
            color='neutral'
            disabled={!props.startEnabled}
            onClick={handleCopyAll}
            sx={BEAM_BTN_SX}
          >
            Скопировать все
          </Button>
        )}

        {!props.startBusy ? (
          <Button
            variant='solid' color={SCATTER_COLOR}
            disabled={!props.startEnabled || props.startBusy} loading={props.startBusy}
            endDecorator={<PlayArrowRoundedIcon />}
            onClick={props.onStart}
            sx={BEAM_BTN_SX}
          >
            Start
          </Button>
        ) : (
          <Button
            variant='solid' color='danger'
            endDecorator={<StopRoundedIcon />}
            onClick={props.onStop}
            sx={BEAM_BTN_SX}
          >
            Stop
          </Button>
        )}
      </Box>

    </Box>
  );
}
