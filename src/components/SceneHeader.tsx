import { useLocalization } from '../store/LocalizationContext';

const SceneHeader: React.FC = () => {
  const { t, locale, setLocale } = useLocalization();
  return (
    <div className='scene-header'>
      <h1>{t('info.game_title')}</h1>
      <div>
        <label htmlFor="locale-select">{t('ui.language')}: </label>
        <select value={locale} onChange={(e) => setLocale(e.target.value as any)}>
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </div>
  );
};

export default SceneHeader;
