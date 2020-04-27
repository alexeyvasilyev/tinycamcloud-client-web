
import { Directive, HostListener, /*Renderer2,*/ ElementRef } from '@angular/core';

@Directive({
    selector: '[lowerCase]'
})

export class LowerCaseDirective {

    constructor(
//        private renderer: Renderer2,
        private el: ElementRef
    ) {
    }

    @HostListener('keyup') onKeyUp() {
      this.el.nativeElement.value = this.el.nativeElement.value.toLowerCase();
      //console.log(this.el.nativeElement.value)
      //console.log('some thing key upped')
    }

}
