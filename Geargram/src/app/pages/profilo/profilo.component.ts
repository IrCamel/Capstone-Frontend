import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.scss']
})
export class ProfiloComponent implements OnInit {
  user: any;
  currentUser: any;
  isFollowing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = +params['id'];
      this.loadUser(userId);
    });
    this.currentUser = this.authService.getCurrentUser();
  }

  loadUser(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      data => {
        console.log('User data loaded:', data); // Logging
        this.user = data;
        this.user.followersCount = this.user.followersCount || 0; // Ensure followersCount is set to 0 if undefined
        this.isFollowing = data.followers.some((follower: any) => follower.id === this.currentUser.id);
      },
      error => {
        console.error('Error loading user data', error);
      }
    );
  }

  toggleFollow(): void {
    if (this.user.id === this.currentUser.id) {
      // Prevent following oneself
      return;
    }

    this.userService.toggleFollow(this.currentUser.id, this.user.id).subscribe(
      (response) => {
        console.log('Follow/unfollow response:', response); // Logging
        this.isFollowing = response.following;
        this.user.followersCount = response.followersCount;
      },
      (error) => {
        console.error('Error following/unfollowing user', error);
      }
    );
  }
}
