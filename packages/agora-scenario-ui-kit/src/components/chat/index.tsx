import React, { FC, useState } from 'react';
import { Icon } from '~components/icon';
import { Placeholder } from '~components/placeholder';
import './index.css';
import { Button } from '~components/button';
import { Message } from './interface';
import { ChatMessage } from './chat-message';
import { ChatMin } from './chat-min';
import { t, transI18n } from '~components/i18n';
import { Affix, AffixProps } from '~components/affix';

export interface ChatProps extends AffixProps {
  /**
   * 消息列表
   */
  messages?: Message[];
  /**
   * 是否对学生禁言
   */
  canChatting?: boolean;
  /**
   * 是否主持人
   */
  isHost?: boolean;
  /**
   * 当前用户 uid
   */
  uid: string | number;
  /**
   * 输入框内容的值
   */
  chatText?: string;

  closeIcon?: React.ReactElement;

  unreadCount?: number;

  /**
   *  禁言状态改变的回调
   */
  onCanChattingChange: (canChatting: boolean) => void;
  /**
   * 输入框发生变化的回调
   */
  onText: (content?: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onSend: () => void | Promise<void>;
  /**
   * 点击最小化的聊天图标
   */
  onClickMiniChat?: () => void | Promise<void>;
}

export const Chat: FC<ChatProps> = ({
  messages,
  canChatting,
  uid,
  isHost,
  chatText,
  closeIcon,
  unreadCount = 0,
  onCanChattingChange,
  onText,
  onSend,
  onCollapse,
  ...resetProps
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  const handleFocus = () => setFocused(true);

  const handleBlur = () => {
    if (!!chatText) {
      return;
    }
    setFocused(false);
  };

  return (
    <Affix
      {...resetProps}
      onCollapse={onCollapse}
      content={<ChatMin unreadCount={unreadCount} />}>
      <div className="chat-panel">
        <div className="chat-header">
          <span className="chat-header-title">{transI18n('message')}</span>
          <span>
            {isHost ? (
              <Icon
                onClick={() => onCanChattingChange(!canChatting)}
                className="chat-header-message-state"
                type={canChatting ? 'message-on' : 'message-off'}
              />
            ) : null}
            <span onClick={() => onCollapse && onCollapse()}>
              {closeIcon && closeIcon}
            </span>
          </span>
        </div>
        {!canChatting ? (
          <div className="chat-notice">
            <span>
              <Icon type="red-caution" />
              <span>{t('placeholder.enable_chat_muted')}</span>
            </span>
          </div>
        ) : null}
        <div className="chat-history">
          {!messages || messages.length === 0 ? (
            <Placeholder placeholderDesc={t('placeholder.empty_chat')} />
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                {...message}
                isOwn={uid === message.uid}
              />
            ))
          )}
        </div>
        <div className={`chat-texting ${!!chatText && focused ? 'focus' : ''}`}>
          <textarea
            value={chatText}
            rows={1}
            className="chat-texting-message"
            placeholder={transI18n('placeholder.input_message')}
            disabled={!isHost && !canChatting}
            onChange={(e) => onText(e.currentTarget.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Button disabled={!isHost && !canChatting} onClick={onSend}>
            {t('send')}
          </Button>
        </div>
      </div>
    </Affix>
  );
};
