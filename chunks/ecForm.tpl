{set $isAdmin = $_modx->user.id && $_modx->context != 'mgr'}

<h3>{'ec_fe_message_add' | lexicon}</h3>
<form class="form well ec-form" method="post" role="form" id="{$fid}" action="">
    <input type="hidden" name="thread" value="{$thread}">
    

    <div class="ec-form__row ec-antispam">
        <label for="{$fid}-{$antispam_field}" class="control-label">{'ec_fe_message_antismap' | lexicon}</label>
        <input type="text" name="{$antispam_field}" class="form-control" id="{$fid}-{$antispam_field}" value="" />
    </div>

    {if $isAdmin}
        <div class="ec-form__row registred">
            <input type="text"  id="{$fid}-user_name" class="form-control"  name="user_name" value="{$_modx->user.fullname ?: $_modx->user.username}">
            <label for="{$fid}-user_name" class="control-label">Менеджер</label>
            <input type="hidden" name="user_email" value="{$_modx->user.email}">
        </div>
    {else}
        <div class="ec-form__row ec-input-parent">
            <input type="text" name="user_name" class="form-control" id="{$fid}-user_name" value="{$user_name}" />
            <label for="{$fid}-user_name" class="control-label">{'ec_fe_message_user_name' | lexicon}</label>
            <span class="ec-error help-block" id="{$fid}-user_name-error"></span>
        </div>
        <div class="ec-form__row ec-input-parent">
            <input type="text" name="user_email" class="form-control" id="{$fid}-user_email" value="{$user_email}" />
            <label for="{$fid}-user_email" class="control-label">{'ec_fe_message_user_email' | lexicon}</label>
            <span class="ec-error help-block" id="{$fid}-user_email-error"></span>
        </div>
    {/if}

    <div class="ec-form__row ec-input-parent">
        <div class="ec-smiles">
          <button type="button" data-smile="😀">😀</button>
          <button type="button" data-smile="😁">😁</button>
          <button type="button" data-smile="😂">😂</button>
          <button type="button" data-smile="🤣">🤣</button>
          <button type="button" data-smile="😊">😊</button>
          <button type="button" data-smile="😉">😉</button>
          <button type="button" data-smile="😍">😍</button>
          <button type="button" data-smile="😎">😎</button>
          <button type="button" data-smile="🤔">🤔</button>
          <button type="button" data-smile="😮">😮</button>
          <button type="button" data-smile="😢">😢</button>
          <button type="button" data-smile="😭">😭</button>
          <button type="button" data-smile="😡">😡</button>
          <button type="button" data-smile="👍">👍</button>
          <button type="button" data-smile="👎">👎</button>
          <button type="button" data-smile="🙏">🙏</button>
          <button type="button" data-smile="❤️">❤️</button>
          <button type="button" data-smile="🔥">🔥</button>
        </div>
        <textarea name="text" class="form-control" 
            rows="3" 
            id="{$fid}-text" 
            required
            maxlength="1000"
            data-maxlength="1000"
        >{$text}</textarea>
        <div class="ec-counter">
          <span class="current">0</span> / 1000
        </div>
        <span class="ec-error help-block" id="{$fid}-text-error"></span>
    </div>

    
    {if !$isAdmin && $agreementCheckbox}
        <div class="ec-form__row checkbox ec-input-parent">
            <label>
                <input type="checkbox" name="agree" value="1" required> {'ec_fe_agree' | lexicon}
            </label>
        </div>
    {/if}

    <div class="buttons">
        <input type="submit" class="btn_red btn-primary" name="send" value="{'ec_fe_send' | lexicon}" />
    </div>
</form>
<div id="{$fid}-success"></div>
