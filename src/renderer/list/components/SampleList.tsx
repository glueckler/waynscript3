import { Pause, PlayArrow } from '@mui/icons-material';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import path from 'path';
import React from 'react';
import { useDrag, useHowlManager, useIPC, useList } from '../hooks';
import { BackgroundAnimBox } from './BackgroundAnimBox';

export function SampleList() {
  useIPC();
  const { handlePlaySample, playingFile } = useHowlManager();
  const { focused, files, focusedNode, selectedPaths, handleSampleClick } =
    useList(handlePlaySample);

  const { handleDragFilepaths } = useDrag();

  function renderFocussedBox(focussed: boolean) {
    if (!focussed) return null;
    return (
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <BackgroundAnimBox />
      </Box>
    );
  }

  return (
    <Box>
      <List dense>
        {files.map((file, index) => {
          return (
            <ListItemButton
              key={file.path}
              component="a"
              draggable
              selected={selectedPaths.includes(file.path)}
              onDragStart={(e: React.DragEvent) => {
                handleDragFilepaths(e, selectedPaths);
              }}
              onClick={(e: React.MouseEvent) => {
                // somehow this also captures "enter" button press
                handleSampleClick(e, file, index);
              }}
              ref={index === focused ? focusedNode : null}
              sx={{ position: 'relative' }}
            >
              {renderFocussedBox(index === focused)}
              <ListItemIcon
                onClick={() => {
                  handlePlaySample(file);
                }}
              >
                <IconButton>
                  {file.path === playingFile ? <Pause /> : <PlayArrow />}
                </IconButton>
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ noWrap: true }}>
                {path.basename(file.path)}
              </ListItemText>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
