/**
 * 로그 관리 유틸리티
 * 클라이언트 사이드 로깅 및 Firebase 연동 로그 저장
 */

import { pushRealtimeData } from '../firebase/queries';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel = LOG_LEVELS.info;

export function setLogLevel(level) {
  currentLevel = LOG_LEVELS[level] ?? LOG_LEVELS.info;
}

function createLogEntry(level, source, message, data = null) {
  return {
    level,
    source,
    message,
    data,
    timestamp: Date.now(),
  };
}

function shouldLog(level) {
  return (LOG_LEVELS[level] ?? 0) >= currentLevel;
}

export function logDebug(source, message, data) {
  if (!shouldLog('debug')) return;
  const entry = createLogEntry('debug', source, message, data);
  console.debug(`[${source}]`, message, data ?? '');
  return entry;
}

export function logInfo(source, message, data) {
  if (!shouldLog('info')) return;
  const entry = createLogEntry('info', source, message, data);
  console.info(`[${source}]`, message, data ?? '');
  return entry;
}

export function logWarn(source, message, data) {
  if (!shouldLog('warn')) return;
  const entry = createLogEntry('warn', source, message, data);
  console.warn(`[${source}]`, message, data ?? '');
  return entry;
}

export function logError(source, message, data) {
  if (!shouldLog('error')) return;
  const entry = createLogEntry('error', source, message, data);
  console.error(`[${source}]`, message, data ?? '');
  return entry;
}

export async function persistLog(entry) {
  if (!entry) return;
  try {
    await pushRealtimeData('logs', entry);
  } catch (err) {
    console.error('Failed to persist log:', err);
  }
}

export async function logAndPersist(level, source, message, data) {
  const logFn = { debug: logDebug, info: logInfo, warn: logWarn, error: logError }[level] || logInfo;
  const entry = logFn(source, message, data);
  await persistLog(entry);
  return entry;
}
