{if $messages?}
    {foreach $messages as $message}
    
        <div id="ec-{$message['thread_name']}-message-{$message['id']}" class="ec-message">
            <div class="ec-message__header">
                <div class="ec-message__meta">
                    <a class="comment-anchor"
                       href="{'productFullUrl' | snippet : ['id' => $_modx->resource.id]}#comment-{$message['id']}"
                       id="comment-{$message['id']}">
                        <span class="num-comment">#{$message['id']}</span>
                    </a>
                    <span class="ec-message__author">{$message['user_name']}</span>
                    
                    <span class="ec-date"
                          data-time="{$message['date']}">
                        {$message['date']}
                    </span>
                </div>
                {if $message['voting_enable']?}
                    {set $voting_button_classes = $message['voting_can_vote'] ? 'js-ec-vote-button enabled' : ''}
                    <div class="ec-message__votes" data-message-id="{$message['id']}" data-properties-key="{$message['properties_key']}">
                        <div class="ec-message__votes-item">
                            <a href="javascript:void(0)" class="{$voting_button_classes} ec-message__votes-button ec-message__votes-button-like {if $message['vote']==1}active{/if}" data-value="1">
                                {$message['likes']}
                            </a>
                        </div>
                        <div class="ec-message__votes-item">
                            <a href="javascript:void(0)" class="{$voting_button_classes} ec-message__votes-button ec-message__votes-button-dislike {if $message['vote']==-1}active{/if}" data-value="-1">
                                {$message['dislikes']}
                            </a>
                        </div>
                        <div class="ec-message__votes-bar"><span class="js-ec-vote-bar" style="width: {$message['votes_rating_percent']}%"></span></div>
                    </div>
                {/if}
            </div>
           
            
            
            <div class="ec-message__text">
            {'ecQuoteParse' | snippet : ['text' => $message['text']]}
            </div>
            {if $message['reply_text']?}
                <div class="ec-message__reply ec-reply" style="margin-top:15px">
                    <p>
                        {if $message['reply_author']}
                            <strong>{$message['reply_author']}:</strong><br>
                        {/if}
                        {$message['reply_text']}
                    </p>
                </div>
            {/if}
            
            {if $message['replies_enable']?}
                <div class="ec-message__footer">
                    <a class="ec-message__footer-link js-ec-reply red" href="javascript:void(0)"
                       data-ec-thread="{$message['thread_name']}"
                       data-ec-message="{$message['id']}">{'ec_fe_reply' | lexicon}</a>
                    <a href="javascript:void(0)"
                       class="ec-message__footer-link js-ec-quote"
                       data-ec-thread="{$message['thread_name']}"
                       data-ec-message="{$message['id']}"
                       data-author="{$message['user_name']}"
                       data-text="{$message['text']|escape}">
                       Цитировать
                    </a>
                </div>
            {/if}
        </div>
        {if $message['replies']?}
        
            {foreach $message['replies'] as $reply}
                <div id="ec-{$message['thread_name']}-reply-{$reply['id']}"
                     class="ec-reply"
                     data-reply-id="{$reply.id}"
                     data-parent-id="{$reply.parent_id}"
                     data-author="{$reply.user_name}">
                    <div class="wraper">
                        <div class="ec-reply__header">
                            <a class="comment-anchor"
                               href="{'productFullUrl' | snippet : ['id' => $_modx->resource.id]}#comment-{$message['id']}-{$reply.id}"
                               id="comment-{$message['id']}-{$reply.id}">
                                <span class="num-comment">#{$message['id']}{$reply.id}</span>
                            </a>
                            <span class="ec-reply__to js-ec-reply-to"></span>
                            <div class="ec-reply__meta">
                                <span class="ec-reply__author">{$reply.user_name}</span>
                                <span class="ec-date" data-time="{$reply.created_on | replace:' ':'T'}">
                                    {$reply.created_on}
                                </span>
                            </div>
                        </div>
                        <div class="ec-reply__text">
                         {'ecQuoteParse' | snippet : ['text' => $reply['text']]}
                        </div>
                        {if $message['replies_enable']?}
                            <div class="ec-reply__footer">
                                <a class="ec-reply__footer-link js-ec-reply" href="javascript:void(0)"
                                   data-ec-thread="{$message['thread_name']}"
                                   data-ec-message="{$message['id']}"
                                   data-ec-parent="{$reply['id']}">{'ec_fe_reply' | lexicon}</a>
                                <a href="javascript:void(0)"
                                   class="ec-message__footer-link js-ec-quote"
                                   data-ec-thread="{$message['thread_name']}"
                                   data-ec-message="{$message['id']}"
                                   data-author="{$reply['user_name']}"
                                   data-ec-parent="{$reply['id']}"
                                   data-text="{$reply['text']|escape}">
                                   Цитировать
                                </a>
                            </div>
                        {/if}
                    </div>
                </div>
            {/foreach}
        {/if}
    {/foreach}
{/if}
